
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { DownloadIcon, TrashIcon } from './Icons';

interface ImageGenerationProps {
  t: (key: string) => string;
}

const ImageGeneration: React.FC<ImageGenerationProps> = ({ t }) => {
  const [prompt, setPrompt] = useState<string>('A high-resolution photo of a futuristic city skyline at dusk, with flying cars and neon lights, cinematic lighting.');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isRemovingBackground, setIsRemovingBackground] = useState<boolean>(false);
  const [bgRemovedImageUrl, setBgRemovedImageUrl] = useState<string | null>(null);
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null);

  const [imageHistory, setImageHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('dreamcanvas_image_history');
      if (savedHistory) {
        setImageHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Failed to load image history from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dreamcanvas_image_history', JSON.stringify(imageHistory));
    } catch (e) {
      console.error('Failed to save image history to localStorage:', e);
    }
  }, [imageHistory]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl('');
    setBgRemovedImageUrl(null);
    setBgRemovalError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const url = `data:image/jpeg;base64,${base64ImageBytes}`;
        setImageUrl(url);
        setImageHistory(prev => [url, ...prev.filter(item => item !== url)].slice(0, 50)); // Add to front, prevent duplicates, limit history to 50
      } else {
        setError('No image was generated. Please try a different prompt.');
      }
    } catch (e) {
      const error = e as Error;
      console.error('Image generation error:', error);
      setError(`Failed to generate image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleRemoveBackground = useCallback(async () => {
    if (!imageUrl) {
        setBgRemovalError('No generated image to process.');
        return;
    }

    setIsRemovingBackground(true);
    setBgRemovalError(null);
    setBgRemovedImageUrl(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const base64Data = imageUrl.split(',')[1];
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
            },
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, { text: 'Remove the background, make the background transparent' }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
            const { data, mimeType } = firstPart.inlineData;
            setBgRemovedImageUrl(`data:${mimeType};base64,${data}`);
        } else {
            setBgRemovalError('Could not remove background. The model may have been unable to perform the requested action.');
        }
    } catch (e) {
        const error = e as Error;
        console.error('Background removal error:', error);
        setBgRemovalError(`Failed to remove background: ${error.message}`);
    } finally {
        setIsRemovingBackground(false);
    }
  }, [imageUrl]);

  const handleDownload = (url: string, filename: string) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDeleteOriginal = () => {
    if (imageUrl) {
        setImageHistory(prev => prev.filter(url => url !== imageUrl));
    }
    setImageUrl('');
    setBgRemovedImageUrl(null);
    setBgRemovalError(null);
  };
  
  const handleDeleteBgRemoved = () => {
    setBgRemovedImageUrl(null);
  };
  
  const handleSelectFromHistory = (url: string) => {
    setImageUrl(url);
    setBgRemovedImageUrl(null);
    setBgRemovalError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFromHistory = (e: React.MouseEvent, urlToDelete: string) => {
    e.stopPropagation();
    setImageHistory(prev => prev.filter(url => url !== urlToDelete));
    if (imageUrl === urlToDelete) {
        setImageUrl('');
        setBgRemovedImageUrl(null);
        setBgRemovalError(null);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-200">{t('imageGeneration.title')}</h2>
      <p className="text-center text-gray-400 mb-6">{t('imageGeneration.description')}</p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('imageGeneration.promptPlaceholder')}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow duration-200 text-gray-200 min-h-[100px] resize-none"
          disabled={isLoading || isRemovingBackground}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim() || isRemovingBackground}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('imageGeneration.generatingButton')}
            </>
          ) : (
            t('imageGeneration.generateButton')
          )}
        </button>
      </div>

      {error && <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
      
      <div className="mt-6">
        {isLoading && (
          <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
            <p className="text-gray-400">Conjuring pixels...</p>
          </div>
        )}
        
        {!isLoading && imageUrl && (
            <div className="space-y-4">
                <div className={`grid gap-6 ${bgRemovedImageUrl || isRemovingBackground ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Original Image */}
                    <div>
                        <div className="w-full aspect-square bg-black rounded-lg overflow-hidden border-2 border-gray-600">
                            <img src={imageUrl} alt="Generated" className="w-full h-full object-contain" />
                        </div>
                        <div className="mt-3 flex justify-center items-center space-x-3">
                            <button
                                onClick={() => handleDownload(imageUrl, `dreamcanvas-original.jpg`)}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                aria-label="Download original image"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>{t('imageGeneration.downloadButton')}</span>
                            </button>
                            <button
                                onClick={handleDeleteOriginal}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                aria-label="Delete original image"
                            >
                                <TrashIcon className="w-5 h-5" />
                                <span>{t('imageGeneration.deleteButton')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Background Removed Slot */}
                    {(bgRemovedImageUrl || isRemovingBackground) && (
                        <div>
                            <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center"
                                 style={{ 
                                     backgroundColor: isRemovingBackground ? '#1F2937' : 'transparent', // gray-800 for loading
                                     backgroundImage: bgRemovedImageUrl ? `url("data:image/svg+xml,%3csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='8' height='8' fill='%23374151'/%3e%3crect x='8' y='8' width='8' height='8' fill='%23374151'/%3e%3crect x='8' width='8' height='8' fill='%234B5563'/%3e%3crect y='8' width='8' height='8' fill='%234B5563'/%3e%3c/svg%3e")` : 'none' 
                                 }}
                            >
                                {isRemovingBackground ? (
                                    <div className="text-center text-gray-400">
                                        <svg className="animate-spin mx-auto h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="mt-2">{t('imageGeneration.processingButton')}</p>
                                    </div>
                                ) : bgRemovedImageUrl ? (
                                    <img 
                                        src={bgRemovedImageUrl} 
                                        alt="Background Removed" 
                                        className="w-full h-full object-contain" 
                                    />
                                ) : null}
                            </div>
                             {bgRemovedImageUrl && !isRemovingBackground && (
                                <div className="mt-3 flex justify-center items-center space-x-3">
                                    <button
                                        onClick={() => handleDownload(bgRemovedImageUrl, `dreamcanvas-bg-removed.png`)}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                        aria-label="Download background-removed image"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        <span>{t('imageGeneration.downloadButton')}</span>
                                    </button>
                                    <button
                                        onClick={handleDeleteBgRemoved}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                        aria-label="Delete background-removed image"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                        <span>{t('imageGeneration.deleteButton')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <button
                    onClick={handleRemoveBackground}
                    disabled={isRemovingBackground}
                    className="w-full flex justify-center items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
                >
                    {isRemovingBackground ? t('imageGeneration.processingButton') : t('imageGeneration.removeBgButton')}
                </button>
                {bgRemovalError && <p className="mt-2 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{bgRemovalError}</p>}
            </div>
        )}

        {!isLoading && !imageUrl && (
          <div className="w-full aspect-square bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="mt-2">{t('imageGeneration.placeholder')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('imageGeneration.historyTitle')}</h3>
        {imageHistory.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {imageHistory.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => handleSelectFromHistory(url)}>
                <img src={url} alt={`History item ${index + 1}`} className="w-full h-full object-cover group-hover:opacity-70 transition-opacity" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => handleDeleteFromHistory(e, url)}
                    className="absolute top-1 right-1 p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-600 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all"
                    title="Delete from history"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-900/50 rounded-lg">
            <p className="text-gray-500">{t('imageGeneration.emptyHistory')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGeneration;
