export const prompt = (userQuery: string, websiteContext: string, websiteHTML: string) => {
    return `Carefully analyze the following webpage HTML and generate **step-by-step navigation instructions** based on the user's query.

## Instructions:
- **Thoroughly read** the HTML structure before responding.
- **Understand the user's intent** and find the most relevant elements.
- **Identify the best selectors** for each step (prefer **name > id > class**).
- **Ensure correctness**: Only use existing elements from the provided HTML.
- **Think step-by-step before answering**: Break down the navigation process logically.

## Input:
User Query: ${userQuery}
Website URL: ${websiteContext}
Website HTML:
${websiteHTML}

## Expected JSON Response Format:
Ensure the response follows this strict JSON format **with no extra text or explanations**:
\`\`\`json
{
  "steps": [
    {
      "selector": "CSS selector for the element",
      "instruction": "Clear instruction for what to do",
      "type": "id | class | name | element",
      "details": {
        "tag": "HTML tag name",
        "id": "id of the element (if available)",
        "class": "CSS class of the element (if available)",
        "name": "name attribute (if available)",
        "other": "other attributes like data-uia (if available)"
      }
    }
  ]
}
\`\`\`

## Additional Requirements:
- If an element has multiple possible selectors, **choose the most specific one** (prefer **name > id > class**).
- Ensure every **step is logically structured** and leads to the final goal.
- If user action requires clicking, entering text, or selecting an option, provide **clear instructions**.

**Your task is to deeply analyze the HTML and generate the most precise, step-by-step instructions.**`;
};

export default prompt;
