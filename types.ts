export interface PunConcept {
  id: string;
  word: string; // The original word/idiom
  logic: string; // Explanation of the pun logic
  topDescription: string; // English description for image gen
  topText: string; // Chinese text for top panel
  bottomDescription: string; // English description for image gen
  bottomText: string; // Chinese text with blanks (e.g. "_ _ _")
  fullPrompt: string; // Combined prompt for reference
}

export type ImageSize = '1K' | '2K' | '4K';

// Augment window for AI Studio API key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
