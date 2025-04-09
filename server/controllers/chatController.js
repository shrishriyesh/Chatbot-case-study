// server/controllers/chatController.js
const deepseekService = require('../services/deepseekService');
const { parseDeepseekResponse } = require('../services/responseParser');
const { validateModelNumber } = require('../services/productApiService');

// Example handler functions for each scenario:
const handleAmbiguousModel = async (options) => {
  // Here you might return a message listing the options and asking the user to specify.
  return `We found several matches for the model number. Did you mean: ${options.join(", ")}?`;
};

const handleTooManyMatches = async () => {
  return "We found too many matches. Please provide a more specific model number.";
};

const handleNotFound = async () => {
  return "No matching model was found. Please check your model number and try again.";
};

const handleValidModel = async (modelNumber, query) => {
  // Proceed with the flow: validate further, scrape data, etc.
  // For demonstration, simply return a confirmation:
  return `Validated model: ${modelNumber}. Proceeding with your query: "${query}"`;
};

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided." });
    
    // 1. Get structured response from Deepseek.
    const deepseekRawResponse = await deepseekService.getDeepseekResponse(message);
    
    // 2. Parse the structured response.
    const { modelNumber, query } = parseDeepseekResponse(deepseekRawResponse);
    
    // 3. Depending on whether a model number was detected, validate it.
    let finalResponse = "";
    
    if (modelNumber !== "NONE") {
      const validationResult = await validateModelNumber(modelNumber);
      switch (validationResult.status) {
        case "valid":
          finalResponse = await handleValidModel(validationResult.model, query);
          break;
        case "ambiguous":
          finalResponse = await handleAmbiguousModel(validationResult.options);
          break;
        case "too_many":
          finalResponse = await handleTooManyMatches();
          break;
        case "not_found":
        default:
          finalResponse = await handleNotFound();
      }
    } else if (query !== "NONE") {
      // If no model number was found, handle only the query.
      finalResponse = await handleQueryOnly(query); // You may already have a function for queries.
    } else {
      finalResponse = "Please provide a valid model number or describe your issue.";
    }
    
    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Error handling chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
