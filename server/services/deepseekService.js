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
      "You are a helpful assistant for PartSelect. " +
      "Analyze the user's message and output exactly two lines in the following format:\n" +
      "MODEL_NUMBER::<model> (if no model is found, output MODEL_NUMBER::NONE)\n" +
      "QUERY::<query> (if no query is found, output QUERY::NONE)\n" +
      "Do not include any extra text.";
      
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
