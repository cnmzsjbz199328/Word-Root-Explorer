import type { WordRootData, RelatedWord } from '../index';

// 兼容浏览器环境，推荐用 window 变量或 import.meta.env
const OPENROUTER_API_KEY = (window as any).OPENROUTER_API_KEY || '';
const SITE_URL = (window as any).SITE_URL || '';
const SITE_NAME = (window as any).SITE_NAME || '';

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

  const prompt = `For the word "${wordToQuery}", identify its main etymological root.
Provide:
1. The root itself (e.g., "port").
2. The meaning of the root (e.g., "to carry").
3. A list of 5-7 English words formed by adding common prefixes OR suffixes to this root.
For each of these related words, provide:
    a. The prefix or suffix used (e.g., "trans", "able").
    b. Its type (either "prefix" or "suffix").
    c. The resulting word (e.g., "transport", "portable").

Return this information as a JSON object with the exact following structure:
{
  "root": "string",
  "rootMeaning": "string",
  "relatedWords": [
    { "prefixOrSuffix": "string", "type": "string", "word": "string" }
  ]
}

Example for "transport" (which has "port" as a root):
{
  "root": "port",
  "rootMeaning": "to carry",
  "relatedWords": [
    { "prefixOrSuffix": "trans", "type": "prefix", "word": "transport" },
    { "prefixOrSuffix": "ex", "type": "prefix", "word": "export" },
    { "prefixOrSuffix": "im", "type": "prefix", "word": "import" },
    { "prefixOrSuffix": "sup", "type": "prefix", "word": "support" },
    { "prefixOrSuffix": "re", "type": "prefix", "word": "report" },
    { "prefixOrSuffix": "able", "type": "suffix", "word": "portable" },
    { "prefixOrSuffix": "er", "type": "suffix", "word": "porter" }
  ]
}
Do not include any commentary or markdown formatting like \`\`\`json outside the JSON object itself. Only return the JSON object.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      ...(SITE_URL ? { "HTTP-Referer": SITE_URL } : {}),
      ...(SITE_NAME ? { "X-Title": SITE_NAME } : {}),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "deepseek/deepseek-chat-v3-0324:free",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch word root data from OpenRouter API.");
  }

  const data = await response.json();
  let jsonStr = "";
  // Try to extract the JSON object from the model's response
  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    jsonStr = data.choices[0].message.content.trim();
    // Remove markdown code block if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }
  } else {
    throw new Error("Unexpected response format from OpenRouter API.");
  }

  let geminiData;
  try {
    geminiData = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error("Failed to parse JSON from OpenRouter API response.");
  }

  if (!geminiData.root || !geminiData.relatedWords || geminiData.relatedWords.length === 0) {
    throw new Error("Could not extract root information from the word. Try a different word.");
  }

  // Validate the type field from response
  for (const rw of geminiData.relatedWords) {
    if (rw.type !== 'prefix' && rw.type !== 'suffix') {
      rw.type = 'prefix';
    }
  }

  const enrichedRelatedWords = await Promise.all(
    geminiData.relatedWords.map(async (rw: any, index: number) => {
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
    root: geminiData.root,
    rootMeaning: geminiData.rootMeaning,
    relatedWords: enrichedRelatedWords as RelatedWord[]
  };
}
