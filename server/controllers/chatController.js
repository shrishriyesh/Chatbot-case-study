// server/controllers/chatController.js
const deepseekService = require('../services/deepseekService');
const { parseDeepseekResponse } = require('../services/responseParser');

// Example handler functions (to be implemented later):
const handleModelOnly = async (modelNumber) => {
  // Call your product API and save the model number for future use.
  // (Placeholder logic)
  return `Handled model: ${modelNumber}`;
};

const handleQueryOnly = async (query) => {
  // Process query that does not reference a product model.
  // (Placeholder logic)
  return `Handled query: ${query}`;
};

const handleBoth = async (modelNumber, query) => {
  // Validate the model and process the query together.
  // (Placeholder logic)
  return `Handled both model: ${modelNumber} and query: ${query}`;
};

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided." });
    
    // Call Deepseek to get a structured response (using the improved system prompt in deepseekService)
    const deepseekRawResponse = await deepseekService.getDeepseekResponse(message);
    
    // Parse the structured response to extract the model number and query.
    const { modelNumber, query } = parseDeepseekResponse(deepseekRawResponse);
    
    // Modular decision-making based on extracted data.
    let finalResponse;
    
    if (modelNumber !== "NONE" && query !== "NONE") {
      // Both model and query are provided.
      finalResponse = await handleBoth(modelNumber, query);
    } else if (modelNumber !== "NONE") {
      // Only model number provided.
      finalResponse = await handleModelOnly(modelNumber);
    } else if (query !== "NONE") {
      // Only query provided.
      finalResponse = await handleQueryOnly(query);
    } else {
      // Neither provided.
      finalResponse = "Please provide more details about your part or issue.";
    }
    
    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Error handling chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
