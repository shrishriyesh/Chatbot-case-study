// server/controllers/chatController.js
const deepseekService = require('../services/deepseekService');

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }

    // Fetch the LLM response using the service
    const deepseekReply = await deepseekService.getDeepseekResponse(message);
    res.json({ response: deepseekReply });
  } catch (error) {
    console.error("Error handling chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
