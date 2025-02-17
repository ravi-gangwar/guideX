import prompt from "@/constants/prompt";
import Groq from 'groq-sdk';

async function generateDetailedSteps(userQuery: string, websiteContext: string, websiteHTML: string, apiKey: string) {
const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true })


  // Limit the size of the input data
  const maxLength = 10000; // Example limit, adjust as needed
  const trimmedUserQuery = userQuery.length > maxLength ? userQuery.substring(0, maxLength) : userQuery;
  const trimmedWebsiteContext = websiteContext.length > maxLength ? websiteContext.substring(0, maxLength) : websiteContext;
  const trimmedWebsiteHTML = websiteHTML && websiteHTML.length > maxLength ? websiteHTML.substring(0, maxLength) : websiteHTML;

  const promptText = prompt(trimmedUserQuery, trimmedWebsiteContext, trimmedWebsiteHTML);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that generates precise website navigation steps with CSS selectors and their attributes."
        },
        {
          role: "user",
          content: promptText
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    let responseText = completion.choices[0]?.message?.content || "{}";

    // Remove unwanted markdown formatting
    responseText = responseText.replace(/^```json\s*|```$/g, '').trim();

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Invalid JSON received from Groq API");
  }
}

export default generateDetailedSteps;