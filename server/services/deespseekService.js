// server/services/deepseekService.js
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.DEEPSEEK_API_KEY; // Your secret API key stored in .env
const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'; // Adjust to your actual Deepseek endpoint

exports.getDeepseekResponse = async (userMessage) => {
  try {
    // Build the payload according to the API's documentation.
    const payload = {
      model: "deepseek/deepseek-chat-v3-0324:free",  // Use your correct model identifier
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ]
    };

    // Make the API call with axios
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
    });

    // Parse and return the LLM response
    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      return "Sorry, I couldn't get a proper response from the LLM.";
    }
  } catch (error) {
    console.error("Error calling Deepseek API:", error);
    throw new Error("Failed to retrieve response from Deepseek");
  }
};
