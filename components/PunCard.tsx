import React, { useState } from 'react';
import { PunConcept, ImageSize } from '../types';
import { generatePunImage } from '../services/geminiService';

interface PunCardProps {
  concept: PunConcept;
  globalImageSize: ImageSize;
}

const PunCard: React.FC<PunCardProps> = ({ concept, globalImageSize }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await generatePunImage(concept, globalImageSize);
      setImageUrl(url);
    } catch (e: any) {
      setError(e.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1">
      {/* Header */}
      <div className="p-5 border-b-2 border-black bg-white">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-black text-black">{concept.word}</h3>
          <div className="px-2 py-1 bg-black text-white text-xs font-bold rounded">
            {concept.id.split('-').pop()}
          </div>
        </div>
        
        <div className="bg-[#FFFDF5] p-3 rounded-lg border-2 border-dashed border-gray-300 mb-4">
            <p className="text-sm text-gray-600 font-medium">
                <span className="text-black font-bold mr-2">脑洞逻辑:</span>
                {concept.logic}
            </p>
        </div>

        {/* Text descriptions preview */}
        <div className="space-y-2 text-xs text-gray-500 mb-2">
            <div className="flex gap-2 items-baseline">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                <span>{concept.topText}</span>
            </div>
             <div className="flex gap-2 items-baseline">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                <span>{concept.bottomText}</span>
            </div>
        </div>
      </div>

      {/* Image Area */}
      <div className="flex-grow bg-gray-50 min-h-[350px] flex items-center justify-center relative border-b-2 border-black">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={concept.word} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
             {!loading && !error && (
                <div className="text-gray-400 flex flex-col items-center">
                    <span className="text-4xl mb-2 opacity-50">🖼️</span>
                    <p className="text-sm font-medium">Waiting to visualize</p>
                </div>
             )}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mb-4"></div>
                <p className="text-black font-bold animate-pulse">绘制中 Painting...</p>
            </div>
          </div>
        )}
        
        {error && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center p-6 text-center z-10">
                <div className="text-red-600">
                    <p className="font-bold mb-1">Oops!</p>
                    <p className="text-xs">{error}</p>
                    <button onClick={handleGenerate} className="mt-4 px-3 py-1 bg-white border border-red-200 shadow-sm rounded-md text-xs hover:bg-gray-50">Try Again</button>
                </div>
            </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-white">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[3px] active:translate-x-[3px] ${
            imageUrl 
            ? 'bg-white text-black hover:bg-gray-50' 
            : 'bg-[#FFD700] text-black'
          }`}
        >
            {imageUrl ? (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    重绘 ({globalImageSize})
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    NanoBanana 生图
                </>
            )}
        </button>
        {imageUrl && (
            <a 
                href={imageUrl} 
                download={`${concept.word}_${globalImageSize}.png`}
                className="block mt-2 text-center text-xs font-bold text-gray-500 hover:text-black hover:underline"
            >
                下载图片
            </a>
        )}
      </div>
    </div>
  );
};

export default PunCard;