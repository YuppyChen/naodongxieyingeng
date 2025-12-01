import { GoogleGenAI } from "@google/genai";
import { PunConcept, ImageSize } from "../types";

// Helper to get AI instance safely with dynamic key check
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return !!process.env.API_KEY; // Fallback for dev environments if env is set
};

export const promptForApiKey = async () => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    alert("API Key selection is not supported in this environment.");
  }
};

export const generatePunConcepts = async (topic: string, count: number): Promise<PunConcept[]> => {
  const ai = getAI();
  
  const systemInstruction = `
# Role
你是一位精通中文博大精深的“谐音梗脑洞大师”与“超现实主义插画家”。你擅长利用中文的同音异字（Homophones）、多义词（Polysemy）和动作类比，创作出意想不到的幽默绘本。

# Goal
当用户输入主题和数量 N 时，利用联网能力搜索与该主题相关的词汇或热词，为我创作 N 个**高难度、高趣味性**的猜词方案。

# Difficulty & Logic (Crucial)
**拒绝简单的字面拆解（如：热狗=热+狗），必须使用以下高级逻辑之一：**

1.  **谐音移花接木 (Homophonic Pun)**：
    * *Logic*: 利用同音字改变词义。
    * *Example*: 目标词“预制菜” (Yu Zhi Cai) -> 谐音“玉掷菜”。
    * *Top*: 展示标准的投掷动作（如掷铁饼）。Text: "这是掷铁饼".
    * *Bottom*: 一块玉 (Jade) 在用力投掷一棵青菜 (Vegetable). Text: "这是 _ _ _".

2.  **强制字面误导 (Forced Literalism)**：
    * *Logic*: 将抽象名词具体化，利用其中一个字的歧义作为上图铺垫。
    * *Example*: 目标词“图书馆” (Tu Shu Guan).
    * *Top*: 展示一根普通的铁管 (Guan). Text: "这是铁管".
    * *Bottom*: 这根管子里塞满了书，或者书本做成的管子. Text: "这是 _ _ _".

3.  **形意错位 (Visual Pun)**：
    * *Example*: 目标词“面包” (Mian Bao).
    * *Top*: 一碗面 (Noodle/Mian) 或者 一张脸 (Face/Mian). Text: "这是面".
    * *Bottom*: 这碗面背着一个书包，或者一张脸背着包. Text: "这是 _ _ _".

# Visual Style
* **Art**: Children's book illustration, crayon drawing, cute, naive style.
* **Background**: **Clean Pure White Background**, no texture.
* **Layout**: Split Screen. Top is the Setup (Misdirection), Bottom is the Punchline (Surreal twist).
* **Text**: 必须精准渲染汉字。

# Content Rules
1.  **上图 (The Setup)**：画一个具体的物体或动作，用来建立某种“逻辑范式”或“声音线索”，**不要直接画出答案的主体**。文字明确写出这个物体的名字。
2.  **下图 (The Punchline)**：基于上图的逻辑进行荒诞的变异。文字只给答案的**带空格下划线**。
3.  **Space Rule**: 下划线数量 = 答案字数。**必须用空格隔开** (e.g., \`_ _ _\`).

# Output Format
Return ONLY a valid JSON array inside a markdown code block (\`\`\`json ... \`\`\`).
The JSON object structure must be:
{
  "word": "The original word/idiom",
  "logic": "Explanation of the logic in Chinese",
  "topDescription": "English visual description for the top panel (Setup)",
  "topText": "Chinese text for top panel (e.g. '这是...')",
  "bottomDescription": "English visual description for the bottom panel (Punchline)",
  "bottomText": "Chinese text for bottom panel (e.g. '这是 _ _ _')"
}
`;

  const userPrompt = `创作主题：${topic}\n数量：${count}个`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use Pro for complex reasoning and search
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable search for topic relevance
        temperature: 1,
      },
    });

    const text = response.text || "";
    
    // Parse JSON from code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    let jsonData = [];
    
    if (jsonMatch && jsonMatch[1]) {
      jsonData = JSON.parse(jsonMatch[1]);
    } else {
        // Fallback try to parse raw text if no code blocks
        try {
            jsonData = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON", text);
            throw new Error("Failed to parse generated concepts.");
        }
    }

    // Map to PunConcept interface
    return jsonData.map((item: any, index: number) => ({
      id: `pun-${Date.now()}-${index}`,
      word: item.word,
      logic: item.logic,
      topDescription: item.topDescription,
      topText: item.topText,
      bottomDescription: item.bottomDescription,
      bottomText: item.bottomText,
      fullPrompt: `
Split screen illustration, children's book style, crayon drawing, clean pure white background.

Top panel: ${item.topDescription}. Text "${item.topText}" written in cute handwritten Chinese font at the bottom center.

Bottom panel: ${item.bottomDescription}. Text "${item.bottomText}" written in cute handwritten Chinese font at the bottom center.

--ar 3:4
      `.trim()
    }));

  } catch (error) {
    console.error("Error generating concepts:", error);
    throw error;
  }
};

export const generatePunImage = async (concept: PunConcept, size: ImageSize): Promise<string> => {
  const ai = getAI();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: concept.fullPrompt }]
      },
      config: {
        imageConfig: {
            imageSize: size,
            aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};