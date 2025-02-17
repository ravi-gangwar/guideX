export const prompt = (userQuery: string, websiteContext: string, websiteHTML: string) => {
    return `Generate step-by-step website navigation instructions based on the following webpage HTML:
  User Query: ${userQuery}
  Website URL: ${websiteContext}
  Website HTML:
  ${websiteHTML}

  Provide a response in this exact JSON format:
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

  - Ensure that the selectors match the actual elements present in the provided HTML.
  - Do not invent non-existent IDs; only use those present in the HTML.
  - If multiple selectors exist (e.g., id, name, or class), prefer name > id > class.
  - Ensure all steps include the "type" and "details" field for maximum accuracy.
  - The response must be **valid JSON only**, with no extra text or explanations.
`;
};

export default prompt;