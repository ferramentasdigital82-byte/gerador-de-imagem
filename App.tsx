
import React, { useState } from 'react';
import { ImageGeneratorIcon, SparkIcon, BoltIcon, ImageEditIcon, UserGroupIcon, LogoutIcon, TagIcon } from './components/Icons';
import ImageGeneration from './components/ImageGeneration';
import ImageEditing from './components/ImageEditing';
import GeminiProChat from './components/GeminiProChat';
import FastChat from './components/FastChat';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import PricingPage from './components/PricingPage';

type Feature = 'generate' | 'edit' | 'chat' | 'fast-chat' | 'pricing';
type View = 'client' | 'admin';

const features: { id: Feature; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'generate', name: 'Generate Image', icon: ImageGeneratorIcon },
  { id: 'edit', name: 'Edit Image', icon: ImageEditIcon },
  { id: 'chat', name: 'Complex Chat', icon: SparkIcon },
  { id: 'fast-chat', name: 'Fast Chat', icon: BoltIcon },
  { id: 'pricing', name: 'Pricing', icon: TagIcon },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeFeature, setActiveFeature] = useState<Feature>('generate');
  const [view, setView] = useState<View>('client');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renderFeature = () => {
    switch (activeFeature) {
      case 'generate':
        return <ImageGeneration />;
      case 'edit':
        return <ImageEditing />;
      case 'chat':
        return <GeminiProChat />;
      case 'fast-chat':
        return <FastChat />;
      case 'pricing':
        return <PricingPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              DreamCanvas
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView(v => v === 'client' ? 'admin' : 'client')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label={view === 'client' ? 'Go to Admin Panel' : 'Go to DreamCanvas'}
              >
                <UserGroupIcon className="w-5 h-5" />
                <span>{view === 'client' ? 'Admin Panel' : 'DreamCanvas'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 bg-red-800/50 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label="Logout"
              >
                <LogoutIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
          {view === 'client' && (
            <nav className="overflow-x-auto">
              <ul className="flex space-x-2 sm:space-x-4 border-b border-gray-700">
                {features.map((feature) => (
                  <li key={feature.id} className="flex-shrink-0">
                    <button
                      onClick={() => setActiveFeature(feature.id)}
                      className={`flex items-center space-x-2 px-3 py-3 text-sm sm:text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-t-lg ${
                        activeFeature === feature.id
                          ? 'text-blue-400 border-b-2 border-blue-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <feature.icon className="w-5 h-5" />
                      <span>{feature.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
        <div className="w-full">
          {view === 'client' ? renderFeature() : <AdminPanel />}
        </div>
      </main>

      <footer className="text-center p-4 text-xs text-gray-500 border-t border-gray-800">
        Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;
