
import React, { useState, useMemo } from 'react';
import { AiMode } from './types';
import { GoogleIcon, BoltIcon, NetworkIntelligenceIcon, AudioSparkIcon } from './components/icons';
import LiveChat from './components/LiveChat';
import TextChat from './components/TextChat';

const ModeSelector: React.FC<{
  selectedMode: AiMode;
  onSelectMode: (mode: AiMode) => void;
}> = ({ selectedMode, onSelectMode }) => {
  const modes = [
    { id: AiMode.Live, name: 'Live Conversation', icon: <AudioSparkIcon className="w-5 h-5" />, description: 'Speak with Rarea in real-time.' },
    { id: AiMode.Thinking, name: 'Deep Thinking', icon: <NetworkIntelligenceIcon className="w-5 h-5" />, description: 'For complex problems.' },
    { id: AiMode.Fast, name: 'Fast Response', icon: <BoltIcon className="w-5 h-5" />, description: 'For quick questions.' },
    { id: AiMode.Search, name: 'Grounded Search', icon: <GoogleIcon className="w-5 h-5" />, description: 'With up-to-date info.' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.id)}
          className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            selectedMode === mode.id
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={mode.description}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.name}</span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState<AiMode>(AiMode.Live);

  const CurrentView = useMemo(() => {
    switch (mode) {
      case AiMode.Live:
        return <LiveChat />;
      case AiMode.Thinking:
      case AiMode.Fast:
      case AiMode.Search:
        return <TextChat key={mode} mode={mode} />;
      default:
        return null;
    }
  }, [mode]);
  
  const modeDetails = useMemo(() => {
    switch(mode) {
        case AiMode.Live: return { title: "Rarea - Live Conversation", description: "Your friendly, feminine AI assistant. Click 'Start' and begin speaking." };
        case AiMode.Thinking: return { title: "Deep Thinking Mode", description: "Leverage gemini-2.5-pro for complex reasoning and problem-solving." };
        // FIX: Updated model name in description to match guidelines.
        case AiMode.Fast: return { title: "Fast Response Mode", description: "Get quick answers with the low-latency gemini-flash-lite-latest model." };
        case AiMode.Search: return { title: "Grounded Search Mode", description: "Ask about current events. Powered by gemini-2.5-flash with Google Search." };
    }
  }, [mode])

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-10 p-4 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Rarea
        </h1>
        <ModeSelector selectedMode={mode} onSelectMode={setMode} />
      </header>
      
      <main className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col bg-gray-800/30 rounded-2xl shadow-2xl border border-gray-700/50">
           <div className="p-4 border-b border-gray-700/50 text-center">
            <h2 className="text-xl font-semibold text-gray-100">{modeDetails.title}</h2>
            <p className="text-sm text-gray-400">{modeDetails.description}</p>
          </div>
          {CurrentView}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        Built with Gemini API & React
      </footer>
    </div>
  );
}
