import React, { useState } from 'react';
import { PunConcept, ImageSize } from './types';
import { generatePunConcepts } from './services/geminiService';
import ApiKeySelector from './components/ApiKeySelector';
import PunCard from './components/PunCard';

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("成语");
  const [count, setCount] = useState<number>(3);
  const [concepts, setConcepts] = useState<PunConcept[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateConcepts = async () => {
    if (!apiKeyReady) return;
    if (!topic.trim()) {
        setError("请输入创作主题 (Please enter a topic)");
        return;
    }
    setLoading(true);
    setError(null);
    setConcepts([]); // Clear previous

    try {
      const newConcepts = await generatePunConcepts(topic, count);
      setConcepts(newConcepts);
    } catch (err: any) {
      setError(err.message || "Failed to generate concepts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-lg border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              脑洞绘本生成器
            </h1>
            <span className="hidden sm:inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
              NanoBanana Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ApiKeySelector onReady={() => setApiKeyReady(true)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Controls Section */}
        <section className="bg-white rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] border-2 border-black p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-end gap-6">
                
                {/* Topic Input */}
                <div className="w-full lg:flex-grow">
                    <label className="block text-sm font-bold text-gray-700 mb-2">创作主题 (Topic)</label>
                    <input 
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="例如：成语、打工人、网络热词..."
                        className="w-full px-4 py-3 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 focus:bg-white transition-all outline-none"
                    />
                </div>

                {/* Count Input */}
                <div className="w-full lg:w-48">
                    <label className="block text-sm font-bold text-gray-700 mb-2">数量 (Count)</label>
                     <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 px-2">
                         <button 
                            onClick={() => setCount(Math.max(1, count - 1))}
                            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-black transition-colors text-xl font-bold"
                         >
                            -
                         </button>
                         <div className="flex-grow text-center font-bold text-xl text-black">{count} 个</div>
                         <button 
                            onClick={() => setCount(Math.min(10, count + 1))}
                            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-black transition-colors text-xl font-bold"
                         >
                            +
                         </button>
                    </div>
                </div>

                 {/* Size Selector */}
                 <div className="w-full lg:w-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-2">画质 (Size)</label>
                    <div className="flex bg-gray-50 p-1 rounded-xl border-2 border-gray-200">
                        {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                            <button
                                key={size}
                                onClick={() => setImageSize(size)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    imageSize === size 
                                    ? 'bg-white text-black shadow-sm border border-gray-200' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <div className="w-full lg:w-auto">
                    <button 
                        onClick={handleGenerateConcepts}
                        disabled={loading || !apiKeyReady}
                        className={`w-full lg:w-auto px-8 py-3.5 rounded-xl font-black text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all ${
                            loading || !apiKeyReady
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-[#FFD700]'
                        }`}
                    >
                        {loading ? "脑洞生成中..." : "💡 开始脑暴"}
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}
        </section>

        {/* Results Grid */}
        <section>
            {concepts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {concepts.map((concept) => (
                        <PunCard 
                            key={concept.id} 
                            concept={concept} 
                            globalImageSize={imageSize} 
                        />
                    ))}
                </div>
            )}
            
            {!loading && concepts.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-xl font-bold text-gray-400">输入主题，看看 AI 有多不正经</p>
                 </div>
            )}
        </section>
      </main>
    </div>
  );
};

export default App;