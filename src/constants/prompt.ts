export const prompt = (userQuery: string, websiteContext: string, websiteElementsJSON: string | undefined) => {
  return `Carefully analyze the following webpage elements and generate **step-by-step navigation instructions** based on the user's query.

  ## Instructions:
  - **Understand the user's intent** and find the most relevant elements.
  - **Identify the best selectors** (prefer **name > id > class**).
  - **Ensure correctness**: Only use existing elements from the provided JSON.
  - **Think step-by-step before answering**: Break down the navigation process logically.

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
          "text": "visible text content (if applicable)",
          "other": "other attributes if relevant"
        }
      }
    ]
  }
  \`\`\`

  ## Additional Requirements:
  - If an element has multiple possible selectors, **choose the most specific one** (prefer **name < class < id**).
  - Ensure every **step is logically structured** and leads to the final goal.
  - If user action requires clicking, entering text, or selecting an option, provide **clear instructions**.

  **Your task is to analyze the webpage elements and generate precise, step-by-step navigation instructions.**

  ## Input:
  User Query: ${userQuery}
  Website URL: ${websiteContext}
  Website Elements JSON:
  ${websiteElementsJSON}
  `;
};
