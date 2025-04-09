// server/controllers/chatController.js
const deepseekService = require('../services/deepseekService');
const { extractModelNumber, determineProductType } = require('../services/nlpService'); // if you have an NLP module
const conversationFlows = require('../handlers/conversationFlowHandlers');

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }
    
    // Get the structured response from Deepseek.
    const deepseekRawResponse = await deepseekService.getDeepseekResponse(message);
    
    // Parse the structured response.
    const lines = deepseekRawResponse.split('\n');
    const modelLine = lines.find((line) => line.startsWith("MODEL_NUMBER::"));
    const queryLine = lines.find((line) => line.startsWith("QUERY::"));
    const modelNumber = modelLine ? modelLine.split("MODEL_NUMBER::")[1].trim() : "MISSING";
    const userQuery = queryLine ? queryLine.split("QUERY::")[1].trim() : "MISSING";
    
    let finalResponse;
    if (modelNumber !== "MISSING" && userQuery !== "MISSING") {
      finalResponse = await conversationFlows.handleBoth(modelNumber, userQuery);
    } else if (modelNumber === "MISSING" && userQuery !== "MISSING") {
      finalResponse = await conversationFlows.handleQueryOnly(userQuery);
    } else if (modelNumber !== "MISSING" && userQuery === "MISSING") {
      finalResponse = await conversationFlows.handleModelOnly(modelNumber);
    } else {
      finalResponse = await conversationFlows.handleMissingBoth();
    }
    
    res.json({ response: finalResponse });
    
  } catch (error) {
    console.error("Error handling chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
