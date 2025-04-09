// server/services/deepseekService.js

const OpenAI = require("openai").default;

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",  // Deepseek API base URL
  apiKey: process.env.DEEPSEEK_API_KEY,   // API key from .env
});

exports.getDeepseekResponse = async (userMessage) => {
  try {
    // Our new system prompt instructs the LLM to output two lines: one for model number and one for query.
    const systemInstruction =
    "You are an expert PartSelect support assistant specialized in home appliance parts, specifically Refrigerator and DishWasher. " +
    "When a user asks a question, you must analyze the message carefully. " +
    "Detect if the message contains a model or serial number (an alphanumeric string that identifies a part) and separate it from the rest of the query. " +
    "Then, output exactly two lines in the precise format described below:\n" +
    "1. MODEL_NUMBER::<model>    (If no valid model or serial number is found, output MODEL_NUMBER::NONE)\n" +
    "2. QUERY::<query>           (If no clear query is detected, output QUERY::NONE)\n" +
    "Do not include any additional text, punctuation, or line breaks.";
      
    // Call the Deepseek API using the chat completions endpoint.
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",  // Ensure this matches the model supported by Deepseek
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMessage },
      ],
    });
    
    // Return the Deepseek response text
    return completion.choices[0].message.content;
    
  } catch (error) {
    console.error("Deepseek API error:", error.response?.data || error);
    throw new Error("Failed to retrieve response from Deepseek");
  }
};
