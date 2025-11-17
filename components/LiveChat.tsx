
import React, { useState, useRef, useCallback, useEffect } from 'react';
// FIX: Removed non-exported member `LiveSession` from import.
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import { MicIcon, StopIcon } from './icons';
import { ChatMessage } from '../types';

// Audio Encoding/Decoding Utilities
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}


const TranscriptionView: React.FC<{ messages: ChatMessage[], currentUserTranscription: string, currentModelTranscription: string }> = ({ messages, currentUserTranscription, currentModelTranscription }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUserTranscription, currentModelTranscription]);

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <p className={`p-3 rounded-lg max-w-lg text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
            {msg.text}
          </p>
        </div>
      ))}
      {currentUserTranscription && (
        <div className="flex justify-end">
           <p className="p-3 rounded-lg max-w-lg text-sm bg-indigo-600/70 text-gray-300 italic">{currentUserTranscription}</p>
        </div>
      )}
      {currentModelTranscription && (
        <div className="flex justify-start">
           <p className="p-3 rounded-lg max-w-lg text-sm bg-gray-700/70 text-gray-300 italic">{currentModelTranscription}</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};


export default function LiveChat() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [transcriptions, setTranscriptions] = useState<ChatMessage[]>([]);
  const [currentUserTranscription, setCurrentUserTranscription] = useState('');
  const [currentModelTranscription, setCurrentModelTranscription] = useState('');
  
  // FIX: Changed LiveSession to `any` as it is not an exported type.
  const sessionRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  // FIX: Added refs to hold current transcription text to avoid stale closures in callbacks.
  const currentUserTranscriptionRef = useRef('');
  const currentModelTranscriptionRef = useRef('');
  
  const stopConversation = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.then(session => session.close());
        sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      stopConversation();
    };
  }, [stopConversation]);

  const startConversation = useCallback(async () => {
    setStatus('connecting');
    setTranscriptions([]);
    setCurrentUserTranscription('');
    setCurrentModelTranscription('');
    // FIX: Reset transcription refs on new conversation.
    currentUserTranscriptionRef.current = '';
    currentModelTranscriptionRef.current = '';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        sessionRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                systemInstruction: 'You are Rarea, a friendly, helpful, and feminine AI assistant. Keep your responses concise and conversational.',
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: () => {
                    if(!inputAudioContextRef.current || !mediaStreamRef.current) return;
                    
                    const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                    mediaStreamSourceRef.current = source;

                    const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        if (sessionRef.current) {
                           sessionRef.current.then((session) => {
                             session.sendRealtimeInput({ media: pcmBlob });
                           });
                        }
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current.destination);
                    setStatus('connected');
                },
                onmessage: async (message: LiveServerMessage) => {
                    // FIX: Use refs to accumulate transcription to prevent stale state in `turnComplete`.
                    if (message.serverContent?.inputTranscription) {
                        currentUserTranscriptionRef.current += message.serverContent.inputTranscription.text;
                        setCurrentUserTranscription(currentUserTranscriptionRef.current);
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentModelTranscriptionRef.current += message.serverContent.outputTranscription.text;
                        setCurrentModelTranscription(currentModelTranscriptionRef.current);
                    }
                    if (message.serverContent?.turnComplete) {
                        const finalUserInput = currentUserTranscriptionRef.current;
                        const finalModelOutput = currentModelTranscriptionRef.current;
                        
                        if (finalUserInput || finalModelOutput) {
                            const newMessages: ChatMessage[] = [];
                            if (finalUserInput) {
                                newMessages.push({ id: `user-${Date.now()}`, role: 'user', text: finalUserInput });
                            }
                            if (finalModelOutput) {
                                newMessages.push({ id: `model-${Date.now()}`, role: 'model', text: finalModelOutput });
                            }
                            setTranscriptions(prev => [...prev, ...newMessages]);
                        }

                        currentUserTranscriptionRef.current = '';
                        currentModelTranscriptionRef.current = '';
                        setCurrentUserTranscription('');
                        setCurrentModelTranscription('');
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                        const source = outputAudioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                // FIX: Changed parameter type from Error to ErrorEvent.
                onerror: (e: ErrorEvent) => {
                    console.error('API Error:', e);
                    setStatus('error');
                    stopConversation();
                },
                onclose: () => {
                    stopConversation();
                },
            },
        });
    } catch (err) {
        console.error('Error starting conversation:', err);
        setStatus('error');
        stopConversation();
    }
  // FIX: Removed unnecessary dependencies to prevent re-creating the function on transcription changes.
  }, [stopConversation]);

  const PulsatingCircle = () => (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-24 h-24 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
      <div className="absolute w-16 h-16 bg-indigo-400 rounded-full animate-ping delay-200 opacity-50"></div>
    </div>
  );
  
  return (
    <div className="flex flex-col flex-grow h-full overflow-hidden">
      <TranscriptionView 
        messages={transcriptions} 
        currentUserTranscription={currentUserTranscription}
        currentModelTranscription={currentModelTranscription}
      />
      
      <div className="flex flex-col items-center justify-center p-4 border-t border-gray-700/50 min-h-[150px]">
        {status === 'connected' && <PulsatingCircle/>}
        {status === 'idle' || status === 'error' ? (
          <button onClick={startConversation} className="flex items-center gap-2 px-6 py-3 text-lg font-semibold bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all transform hover:scale-105">
            <MicIcon/> Start Conversation
          </button>
        ) : status === 'connecting' ? (
             <button disabled className="flex items-center gap-2 px-6 py-3 text-lg font-semibold bg-indigo-500 rounded-full cursor-wait">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
            </button>
        ) : (
          <button onClick={stopConversation} className="flex items-center gap-2 px-6 py-3 text-lg font-semibold bg-red-600 rounded-full hover:bg-red-500 transition-all transform hover:scale-105">
            <StopIcon/> Stop Conversation
          </button>
        )}
        {status === 'error' && <p className="mt-4 text-sm text-red-400">Could not start. Please check permissions and try again.</p>}
      </div>
    </div>
  );
}
