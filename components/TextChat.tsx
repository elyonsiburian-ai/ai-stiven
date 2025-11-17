
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AiMode, ChatMessage } from '../types';
import { BotIcon, UserIcon, SendIcon } from './icons';

const ChatMessageView: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-indigo-500' : 'bg-gray-600'}`}>
        {isModel ? <BotIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div className={`p-3 rounded-lg max-w-lg ${isModel ? 'bg-gray-700' : 'bg-indigo-600'}`}>
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {message.groundingChunks && message.groundingChunks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
            <div className="flex flex-col gap-2">
              {message.groundingChunks.map((chunk, index) => (
                <a
                  key={index}
                  href={chunk.web.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline truncate"
                >
                  {chunk.web.title || chunk.web.uri}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function TextChat({ mode }: { mode: AiMode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when mode changes
    setMessages([]);
    chatRef.current = null;
  }, [mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      let response: GenerateContentResponse | null = null;
      let modelMessage: ChatMessage;

      if (mode === AiMode.Search) {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: input.trim(),
          config: { tools: [{ googleSearch: {} }] },
        });
        modelMessage = {
          id: Date.now().toString() + 'model',
          role: 'model',
          text: response.text,
          groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
        };
      } else {
        if (!chatRef.current) {
          const modelConfig = {
            [AiMode.Thinking]: { model: 'gemini-2.5-pro', config: { thinkingConfig: { thinkingBudget: 32768 } } },
            // FIX: Corrected model name from 'gemini-2.5-flash-lite' to 'gemini-flash-lite-latest'.
            [AiMode.Fast]: { model: 'gemini-flash-lite-latest', config: {} },
          };
          const { model, config } = modelConfig[mode as keyof typeof modelConfig];
          chatRef.current = ai.chats.create({ model, config });
        }
        response = await chatRef.current.sendMessage({ message: input.trim() });
        modelMessage = {
          id: Date.now().toString() + 'model',
          role: 'model',
          text: response.text,
        };
      }
      
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + 'error',
        role: 'system',
        text: 'Sorry, something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-grow h-full overflow-hidden">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map(msg => <ChatMessageView key={msg.id} message={msg} />)}
        {isLoading && (
           <div className="flex items-start gap-3 my-4">
             <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
               <BotIcon className="w-5 h-5 text-white" />
             </div>
             <div className="p-3 rounded-lg bg-gray-700 flex items-center space-x-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700/50">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow bg-gray-700 rounded-full py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 rounded-full p-2 text-white disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors">
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
