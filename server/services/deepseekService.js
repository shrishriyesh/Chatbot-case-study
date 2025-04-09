// server/services/deepseekService.js

// If you are using CommonJS, require the default export:
const OpenAI = require("openai").default;

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",  // Deepseek API base URL
  apiKey: process.env.DEEPSEEK_API_KEY,  // Your API key loaded from .env
});

exports.getDeepseekResponse = async (userMessage) => {
  try {
    // Call the Deepseek API using the chat completions endpoint.
    // Note: The model name should match what Deepseek expects; based on the documentation it's "deepseek-chat".
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: userMessage },
      ],
    });
    // Return the assistant's reply (assuming the response format is similar to OpenAI's)
    return completion.choices[0].message.content;
  } catch (error) {
    // Log the detailed error from Deepseek for debugging purposes
    console.error("Deepseek API error:", error.response?.data || error);
    throw new Error("Failed to retrieve response from Deepseek");
  }
};
