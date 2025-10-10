import { useState } from "react";

export type AIProvider = "gemini" | "perplexity";

interface UseAIGenerationProps {
  onContentGenerated: (content: string) => void;
  onError: (error: string) => void;
}

export const useAIGeneration = ({
  onContentGenerated,
  onError,
}: UseAIGenerationProps) => {
  const [generating, setGenerating] = useState(false);

  const generateContent = async (
    provider: AIProvider,
    title: string,
    description: string,
    references?: string
  ) => {
    if (!title || !description) {
      onError("Title and description are required for AI generation");
      return;
    }

    setGenerating(true);

    try {
      let generatedContent = "";

      if (provider === "gemini") {
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Gemini API key not configured");
        }
        // Call Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Write a comprehensive blog post with the following title and description. Structure it professionally with:

1. An engaging introduction that hooks the reader
2. 3-4 main body sections with descriptive headings
3. Each section should have 2-3 paragraphs of detailed, informative content
4. Include relevant examples, statistics, or insights where appropriate
5. A compelling conclusion that summarizes key points and includes a call-to-action
6. Use proper HTML formatting with <h2> for section headings, <p> for paragraphs, <strong> for emphasis, and <ul>/<li> for lists where needed

Title: "${title}"
Description: "${description}"
${references ? `Additional References: ${references}` : ''}

Make the content SEO-friendly, engaging, and valuable for readers. Ensure it's well-structured and flows naturally.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate content with Gemini");
        }

        const data = await response.json();
        generatedContent = data.candidates[0].content.parts[0].text;
      } else if (provider === "perplexity") {
        const apiKey = (import.meta as any).env.VITE_PERPLEXITY_API_KEY;
        if (!apiKey) {
          throw new Error("Perplexity API key not configured");
        }
        // Call Perplexity API
        const response = await fetch(
          "https://api.perplexity.ai/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [
                {
                  role: "user",
                  content: `Write a comprehensive blog post with the following title and description. Structure it professionally with:

1. An engaging introduction that hooks the reader
2. 3-4 main body sections with descriptive headings
3. Each section should have 2-3 paragraphs of detailed, informative content
4. Include relevant examples, statistics, or insights where appropriate
5. A compelling conclusion that summarizes key points and includes a call-to-action
6. Use proper HTML formatting with <h2> for section headings, <p> for paragraphs, <strong> for emphasis, and <ul>/<li> for lists where needed

Title: "${title}"
Description: "${description}"

Make the content SEO-friendly, engaging, and valuable for readers. Ensure it's well-structured and flows naturally.`,
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to generate content with Perplexity");
        }

        const data = await response.json();
        generatedContent = data.choices[0].message.content;
      }

      onContentGenerated(generatedContent);
    } catch (err) {
      console.error("Error generating content:", err);
      onError(
        err instanceof Error
          ? err.message
          : "Failed to generate content with AI"
      );
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateContent,
    generating,
  };
};
