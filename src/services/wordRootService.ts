import type { WordRootData, RelatedWord } from '../index';

const colors = [
  'from-blue-500 to-blue-600', 'from-purple-500 to-purple-600',
  'from-green-500 to-green-600', 'from-orange-500 to-orange-600',
  'from-indigo-500 to-indigo-600', 'from-red-500 to-red-600',
  'from-pink-500 to-pink-600', 'from-teal-500 to-teal-600'
];

export async function fetchWordRootData(wordToQuery: string): Promise<WordRootData> {
  if (!wordToQuery.trim()) {
    throw new Error("Please enter a word.");
  }

  const proxyUrl = "https://cloudcomputeing-api-proxy.tj15982183241.workers.dev/word-root";
  const body = { word: wordToQuery };

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("Failed to fetch word root data from proxy API.\n" + text);
  }

  const data = await response.json();

  if (!data.root || !data.relatedWords || data.relatedWords.length === 0) {
    throw new Error("Could not extract root information from the word. Try a different word.");
  }

  for (const rw of data.relatedWords) {
    if (rw.type !== 'prefix' && rw.type !== 'suffix') {
      rw.type = 'prefix';
    }
  }

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

  return {
    root: data.root,
    rootMeaning: data.rootMeaning,
    relatedWords: enrichedRelatedWords as RelatedWord[]
  };
}
