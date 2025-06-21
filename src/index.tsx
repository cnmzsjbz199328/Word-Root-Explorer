import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Calendar, RotateCw, Sparkles, Search, Loader2, AlertTriangle } from 'lucide-react';
import { fetchWordRootData } from './services/wordRootService';

// Type definitions
export type RelatedWord = {
  prefixOrSuffix: string;
  word: string;
  type: 'prefix' | 'suffix';
  definition?: string;
  example?: string;
  color: string;
};

export type WordRootData = {
  root: string;
  rootMeaning: string;
  relatedWords: RelatedWord[];
};

export type ApiRelatedWordStructure = {
  prefixOrSuffix: string;
  word: string;
  type: 'prefix' | 'suffix';
};

export type ApiData = {
  root: string;
  rootMeaning: string;
  relatedWords: ApiRelatedWordStructure[];
};

const colors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-red-500 to-orange-600',
  'from-indigo-500 to-purple-600',
  'from-teal-500 to-cyan-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600'
];

const WordRootCard = ({ data }: { data: WordRootData | null }) => {
  const [currentAffixIndex, setCurrentAffixIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    setCurrentAffixIndex(0);
  }, [data]);

  if (!data || !data.relatedWords || data.relatedWords.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <BookOpen size={48} className="mx-auto mb-4" />
        <p>Enter a word above to explore its roots.</p>
        <p className="text-sm mt-2">For example, try "vision", "construct", or "reject".</p>
      </div>
    );
  }

  const currentWord = data.relatedWords[currentAffixIndex];

  const handleAffixClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentAffixIndex((prev) => (prev + 1) % (data.relatedWords?.length || 1));
      setIsFlipping(false);
    }, 300);
  };

  const AffixElement = (
    <div
      className="relative cursor-pointer group"
      onClick={handleAffixClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAffixClick(); }}
      role="button"
      tabIndex={0}
      aria-label={`Flip to next word combination. Current affix: ${currentWord.prefixOrSuffix}`}
    >
      <div
        className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl text-white font-bold text-2xl sm:text-3xl transition-all duration-300 bg-gradient-to-r ${currentWord.color} hover:scale-105 hover:shadow-lg ${isFlipping ? 'scale-95 rotate-12' : ''}`}
        style={{ transform: isFlipping ? 'rotateY(90deg) scale(0.8)' : 'rotateY(0deg) scale(1)', transition: 'all 0.3s ease-in-out' }}
      >
        {currentWord.prefixOrSuffix}
      </div>
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white rounded-full p-1 shadow-lg"><RotateCw className="text-gray-600" size={16} /></div>
      </div>
      <Sparkles className="absolute -top-3 -left-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" size={20} />
    </div>
  );

  const RootElement = (
    <div className="px-4 py-3 sm:px-6 sm:py-4 text-3xl sm:text-4xl font-bold text-gray-700 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-xl border-2 sm:border-3 border-yellow-400 shadow-lg">
      {data.root}
    </div>
  );

  const PlusElement = (
    <div className="px-2 sm:px-4 text-2xl sm:text-3xl font-bold text-gray-400 my-2 sm:my-0">+</div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Root Knowledge
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-yellow-200 px-6 py-3 rounded-lg border-2 border-yellow-400 shadow-sm">
            <span className="font-bold text-3xl text-gray-800">{data.root}</span>
          </div>
          <div>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Root Meaning:</span> {data.rootMeaning}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>

        <div className="text-center mb-8 relative">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-6">Current Word Combination</h2>

          <div className="flex items-center justify-center mb-8">
            <div className="flex flex-col sm:flex-row items-center bg-gray-50 rounded-2xl p-4 sm:p-6 border-2 border-dashed border-gray-200 shadow-inner">
              {currentWord.type === 'prefix' ? (
                <>
                  {AffixElement}
                  {PlusElement}
                  {RootElement}
                </>
              ) : (
                <>
                  {RootElement}
                  {PlusElement}
                  {AffixElement}
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className={`inline-block px-6 py-3 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r ${currentWord.color} text-white shadow-lg transform transition-all duration-500 ${isFlipping ? 'scale-110' : 'scale-100'}`}>
              <h3 className="text-3xl sm:text-5xl font-bold mb-1 sm:mb-2">{currentWord.word}</h3>
              <p className="text-lg sm:text-xl opacity-90">{currentWord.definition || 'Meaning not available.'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-inner p-6 mb-6 border border-gray-200 transition-all duration-500">
          <div className="flex items-start gap-4">
            <BookOpen className="text-blue-600 mt-1 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Example Sentence</h4>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-gray-700 italic text-lg">{currentWord.example || 'Example not available.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100">
          <span className="text-gray-600">
            {currentAffixIndex + 1} / {data.relatedWords.length}
            <span className="ml-2 text-sm">
              {currentWord.type === 'prefix'
                ? `(${currentWord.prefixOrSuffix}-${data.root})`
                : `(${data.root}-${currentWord.prefixOrSuffix})`}
            </span>
          </span>
        </div>
        <button
          onClick={handleAffixClick}
          className={`px-6 py-3 bg-gradient-to-r ${currentWord.color} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2`}
        >
          <RotateCw size={18} /> Flip Next
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [wordData, setWordData] = useState<WordRootData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWordData(null);
    console.log('[App] handleSubmit, userInput:', userInput);
    try {
      const data = await fetchWordRootData(userInput);
      setWordData(data);
      console.log('[App] setWordData:', data);
    } catch (e: any) {
      setError(e.message || "Failed to process word. Please try again or a different word.");
      setWordData(null);
      console.error('[App] fetch error:', e);
    } finally {
      setLoading(false);
      console.log('[App] loading finished');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calendar className="text-blue-600" size={32} />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Word Root Explorer</h1>
        </div>
        <p className="text-gray-600">Enter a word to discover its root and related vocabulary.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8 sm:mb-12 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., transport, vision, reject"
          className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          aria-label="Enter a word"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Search size={20} className="mr-0 sm:mr-2" />}
          <span className="hidden sm:inline">Explore</span>
        </button>
      </form>

      {error && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-md flex items-center">
          <AlertTriangle size={24} className="mr-3 text-red-500 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading && !error && (
        <div className="text-center py-10">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
          <p className="text-gray-600 mt-4 text-lg">Exploring word roots... this may take a moment.</p>
        </div>
      )}

      {!loading && wordData && <WordRootCard data={wordData} />}
      {!loading && !wordData && !error && (
        <div className="max-w-4xl mx-auto text-center py-10 text-gray-500 opacity-75">
          <BookOpen size={48} className="mx-auto mb-4" />
          <p className="text-lg">Welcome to the Word Root Explorer!</p>
          <p>Enter a word in the search bar above to begin your journey into etymology.</p>
          <p className="text-sm mt-2">Discover how words are built and interconnected.</p>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}