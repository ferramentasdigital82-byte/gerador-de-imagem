
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

type AspectRatio = '16:9' | '9:16';

const loadingMessages = [
    'Warming up the digital film...',
    'Choreographing the pixels...',
    'This can take a few minutes, your masterpiece is brewing...',
    'Rendering cinematic magic...',
    'Almost there, adding the finishing touches...',
];

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      imageBytes: await base64EncodedDataPromise,
      mimeType: file.type,
    };
};

const VeoAnimation: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('The person in the image slowly starts to smile, and the background subtly animates with sparkling lights.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const loadingIntervalRef = useRef<number | null>(null);

  const checkApiKey = useCallback(async () => {
    try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
    } catch (e) {
        console.error("Error checking API key:", e);
        setApiKeySelected(false); // Assume no key on error
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      loadingIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 4000);
    } else if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [isLoading]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Optimistically assume key selection was successful to improve UX.
      setApiKeySelected(true);
    } catch(e) {
      console.error("Error opening select key dialog", e);
      setError("Could not open API key selection. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setVideoUrl(null);
      setError(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image to animate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Re-create instance to ensure it uses the latest key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const imagePart = await fileToGenerativePart(imageFile);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imagePart,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        },
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(videoBlob));
      } else {
        throw new Error('Video generation finished but no download link was provided.');
      }
    } catch (e) {
      const error = e as Error;
      console.error('Video generation error:', error);
      let errorMessage = `Failed to generate video: ${error.message}`;
      if (error.message.includes('Requested entity was not found')) {
        errorMessage = 'API Key is invalid. Please select a valid API key and try again.';
        setApiKeySelected(false);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, imageFile, aspectRatio]);

  if (!apiKeySelected) {
    return (
        <div className="max-w-2xl mx-auto text-center p-8 bg-gray-800 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
            <p className="text-gray-400 mb-6">
                The Veo model requires you to select a personal API key. Your key is used for billing and is not stored by this application.
                <br />
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                    Learn more about billing.
                </a>
            </p>
            <button
                onClick={handleSelectKey}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
                Select API Key
            </button>
            {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-200">Animate Image with Veo</h2>
        <p className="text-center text-gray-400 mb-6">Upload an image, optionally describe an animation, and watch Veo bring it to life.</p>
        
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg">
                {previewUrl ? (
                    <img src={previewUrl} alt="Upload preview" className="max-h-64 w-auto rounded-md" />
                ) : (
                    <div className="text-center text-gray-400">
                        <p>Upload an image to start</p>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={isLoading} />
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Optional: Describe the animation (e.g., make the clouds move)"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-200 min-h-[100px] resize-none"
                disabled={isLoading}
            />

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <div className="flex space-x-4">
                    {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${aspectRatio === ratio ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                            {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !imageFile}
                className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? 'Animating...' : 'Generate Video'}
            </button>
        </div>

        {error && <p className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        <div className="mt-6">
            {isLoading && (
                <div className="w-full aspect-video bg-gray-700 rounded-lg flex flex-col items-center justify-center animate-pulse p-4">
                     <svg className="animate-spin h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-300 text-center">{loadingMessage}</p>
                </div>
            )}
            {videoUrl && !isLoading && (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-gray-600">
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                </div>
            )}
        </div>
    </div>
  );
};

export default VeoAnimation;
