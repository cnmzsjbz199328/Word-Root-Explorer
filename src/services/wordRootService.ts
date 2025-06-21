import type { WordRootData, RelatedWord } from '../index';

// 兼容浏览器环境，推荐用 window 变量或 import.meta.env
const OPENROUTER_API_KEY = (window as any).OPENROUTER_API_KEY || '';
const SITE_URL = (window as any).SITE_URL || '';
const SITE_NAME = (window as any).SITE_NAME || '';

console.log('[env] OPENROUTER_API_KEY:', OPENROUTER_API_KEY ? '***' : 'MISSING');
console.log('[env] SITE_URL:', SITE_URL);
console.log('[env] SITE_NAME:', SITE_NAME);

const colors = [
  'from-blue-500 to-blue-600', 'from-purple-500 to-purple-600',
  'from-green-500 to-green-600', 'from-orange-500 to-orange-600',
  'from-indigo-500 to-indigo-600', 'from-red-500 to-red-600',
  'from-pink-500 to-pink-600', 'from-teal-500 to-teal-600'
];

export async function fetchWordRootData(wordToQuery: string): Promise<WordRootData> {
  console.log('[service] fetchWordRootData called with:', wordToQuery);
  if (!wordToQuery.trim()) {
    console.warn('[service] Empty input');
    throw new Error("Please enter a word.");
  }

  // 只传递 word 到后端，后端拼接 prompt
  const proxyUrl = "https://cloudcomputeing-api-proxy.tj15982183241.workers.dev/word-root";
  const body = { word: wordToQuery };
  console.log('[service] Proxy request body:', body);

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  console.log('[service] Proxy response status:', response.status);

  if (!response.ok) {
    const text = await response.text();
    console.error('[service] Proxy error response:', text);
    throw new Error("Failed to fetch word root data from proxy API.");
  }

  const data = await response.json();
  console.log('[service] Proxy API response:', data);
  console.log('[service] Full proxy API response:', JSON.stringify(data, null, 2));

  if (!data.root || !data.relatedWords || data.relatedWords.length === 0) {
    console.error('[service] Missing root or relatedWords:', data);
    throw new Error("Could not extract root information from the word. Try a different word.");
  }

  for (const rw of data.relatedWords) {
    if (rw.type !== 'prefix' && rw.type !== 'suffix') {
      rw.type = 'prefix';
    }
  }

  // enrich relatedWords with definition/example/color
  const enrichedRelatedWords = await Promise.all(
    data.relatedWords.map(async (rw: any, index: number) => {
      let definition = 'Definition not found.';
      let example = 'Example not found.';
      try {
        const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${rw.word}`);
        if (dictResponse.ok) {
          const dictData = await dictResponse.json();
          if (Array.isArray(dictData) && dictData.length > 0) {
            const firstEntry = dictData[0];
            if (firstEntry.meanings && firstEntry.meanings.length > 0) {
              const firstMeaning = firstEntry.meanings[0];
              if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
                definition = firstMeaning.definitions[0].definition;
                example = firstMeaning.definitions.find((d: any) => d.example)?.example || 'Example not available.';
              }
            }
          }
        }
      } catch (e) {
        // ignore
      }
      return {
        ...rw,
        definition,
        example,
        color: colors[index % colors.length]
      };
    })
  );

  const result = {
    root: data.root,
    rootMeaning: data.rootMeaning,
    relatedWords: enrichedRelatedWords as RelatedWord[]
  };
  console.log('[service] Final result:', result);
  return result;
}
