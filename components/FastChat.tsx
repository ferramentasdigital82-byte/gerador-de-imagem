
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { CopyIcon, CheckIcon, LibraryIcon } from './Icons';

// This is a browser-specific feature.
declare global {
    interface Window {
        marked: {
            parse(markdown: string): string;
        };
    }
}

interface FastChatProps {
  t: (key: string) => string;
}

const FastChat: React.FC<FastChatProps> = ({ t }) => {
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    try {
      const savedHistory = localStorage.getItem('dreamcanvas_fast_chat_history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Could not load chat history from localStorage', error);
      return [];
    }
  });
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [copiedLibraryPromptIndex, setCopiedLibraryPromptIndex] = useState<number | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash-lite',
      config: {
        systemInstruction: 'You are an extremely fast and concise AI assistant. Your primary goal is to provide immediate, to-the-point answers. Avoid pleasantries and lengthy explanations.',
      },
    });
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem('dreamcanvas_fast_chat_history', JSON.stringify(history));
    } catch (error) {
      console.error('Could not save chat history to localStorage', error);
    }
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const userPrompts = useMemo(() => {
    const prompts = history
      .filter(msg => msg.role === 'user')
      .map(msg => msg.parts[0].text);
    return [...new Set(prompts)].reverse();
  }, [history]);
  
  const handleCopyFromLibrary = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedLibraryPromptIndex(index);
    setTimeout(() => setCopiedLibraryPromptIndex(null), 2000);
  };

  const handleUsePrompt = (text: string) => {
    setUserInput(text);
    setIsPromptLibraryOpen(false);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000); // Reset after 2 seconds
  };

  const handleSend = useCallback(async () => {
    if (!userInput.trim() || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUserInput('');

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userInput });
      
      let modelResponse = '';
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
      setHistory(prev => [...prev, modelMessage]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
          return newHistory;
        });
      }
    } catch (e) {
      console.error('Streaming chat error:', e);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: `Error: ${(e as Error).message}` }] };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput]);
  
  return (
    <>
      <div className="max-w-4xl mx-auto flex flex-col h-[70vh] bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-200">{t('chat.fastChatTitle')}</h2>
            <button
                onClick={() => setIsPromptLibraryOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label={t('chat.libraryButton')}
                title={t('chat.libraryButton')}
            >
                <LibraryIcon className="w-5 h-5" />
                <span>{t('chat.libraryButton')}</span>
            </button>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative group max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: window.marked.parse(msg.parts[0].text) }} />
                  {msg.role === 'user' && (
                    <button
                        onClick={() => handleCopy(msg.parts[0].text, index)}
                        className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 p-1.5 bg-gray-700/80 backdrop-blur-sm rounded-full text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:scale-110 hover:text-white"
                        aria-label={t('chat.copyPrompt')}
                        title={t('chat.copyPrompt')}
                    >
                        {copiedPromptIndex === index ? (
                            <CheckIcon className="w-4 h-4 text-green-400" />
                        ) : (
                            <CopyIcon className="w-4 h-4" />
                        )}
                    </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && history[history.length-1]?.role !== 'model' && (
              <div className="flex justify-start">
                  <div className="max-w-lg p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      </div>
                  </div>
              </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.fastPromptPlaceholder')}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-200"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
              {t('chat.sendButton')}
            </button>
          </div>
        </div>
      </div>

      {isPromptLibraryOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
          onClick={() => setIsPromptLibraryOpen(false)}
        >
            <div 
              className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-700 flex flex-col h-[80vh] max-h-[600px]"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <LibraryIcon className="w-6 h-6" />
                        <span>{t('chat.libraryTitle')}</span>
                    </h3>
                    <button 
                        onClick={() => setIsPromptLibraryOpen(false)} 
                        className="text-gray-400 hover:text-white text-2xl leading-none"
                        aria-label="Close prompt library"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-4 overflow-y-auto space-y-3">
                    {userPrompts.length > 0 ? (
                        userPrompts.map((prompt, index) => (
                            <div key={index} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center gap-4 group">
                                <p className="text-gray-300 text-sm flex-grow break-words">{prompt}</p>
                                <div className="flex space-x-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleCopyFromLibrary(prompt, index)} 
                                        title={t('chat.copyPrompt')}
                                        className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
                                    >
                                        {copiedLibraryPromptIndex === index ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                                    </button>
                                    <button 
                                        onClick={() => handleUsePrompt(prompt)}
                                        title={t('chat.usePrompt')}
                                        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {t('chat.usePrompt')}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-10">
                            <p>{t('chat.emptyLibrary')}</p>
                            <p className="text-sm text-gray-500">{t('chat.emptyLibraryDesc')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default FastChat;
