import useGemini from "@/aiModels/gemini";
import { prompt } from "@/constants/prompt";


async function generateDetailedSteps(userQuery: string, websiteContext: string, websiteHTML: string | undefined, apiKey: string) {
  console.log("Generating detailed steps...", { userQuery, websiteContext, websiteHTML, apiKey });

  const maxLength = 20000;
  const trimmedUserQuery = userQuery.length > maxLength ? userQuery.substring(0, maxLength) : userQuery;
  const trimmedWebsiteContext = websiteContext.length > maxLength ? websiteContext.substring(0, maxLength) : websiteContext;

  const promptText = prompt(trimmedUserQuery, trimmedWebsiteContext, websiteHTML);

  try {
    // Call Gemini API
    const responseText = await useGemini(promptText);
    // Extract JSON from Markdown code block
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      throw new Error("Invalid response format (JSON block not found)");
    }

    // Parse the extracted JSON
    const parsedData = JSON.parse(jsonMatch[1]);

    return parsedData;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Invalid JSON received from Gemini API");
  }
}

export default generateDetailedSteps;
