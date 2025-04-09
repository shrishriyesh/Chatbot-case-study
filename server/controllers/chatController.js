// server/controllers/chatController.js
const deepseekService = require('../services/deepseekService');
const { parseDeepseekResponse } = require('../services/responseParser');
const { validateModelOrPart } = require('../services/productApiService');

// Handlers for different cases:
const handleValidModel = async (model, query) => {
  // In a valid model scenario, use the product identifier (model) with the query.
  return await deepseekService.getFinalResponseForProduct(model, query);
};

const handleAmbiguousModel = async (options) => {
  return `Multiple possible models found: ${options.join(", ")}. Please specify which one is yours.`;
};

const handleTooManyMatches = async () => {
  return "Too many model matches found. Please provide a more specific model or serial number.";
};

const handlePartValid = async (productIdentifier, query) => {
  // Use the part product identifier (which might be a URL or part number) with the query.
  return await deepseekService.getFinalResponseForProduct(productIdentifier, query);
};

const handleQueryOnly = async (query) => {
  // If no product identifier is found, simply handle the query.
  return `Here's the answer to your query: "${query}" (No product identifier was provided.)`;
};

const handleNotFound = async () => {
  return "No valid model or part number was found. Please check your input and try again.";
};

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided." });
    
    // 1. Get structured response from Deepseek.
    const deepseekRawResponse = await deepseekService.getDeepseekResponse(message);
    
    // 2. Parse the Deepseek response.
    const { modelNumber, query } = parseDeepseekResponse(deepseekRawResponse);
    
    let finalResponse = "";
    if (modelNumber !== "NONE") {
      const validation = await validateModelOrPart(modelNumber);
      if (validation.type === "model") {
        if (validation.status === "valid") {
          finalResponse = await handleValidModel(validation.model, query);
        } else if (validation.status === "ambiguous") {
          finalResponse = await handleAmbiguousModel(validation.options);
        } else if (validation.status === "too_many") {
          finalResponse = await handleTooManyMatches();
        } else {
          finalResponse = await handleNotFound();
        }
      } else if (validation.type === "part") {
        if (validation.status === "valid") {
          finalResponse = await handlePartValid(validation.url, query);
        } else {
          finalResponse = await handleNotFound();
        }
      }
    } else if (query !== "NONE") {
      finalResponse = await handleQueryOnly(query);
    } else {
      finalResponse = "Please provide a valid model, part number, or describe your issue.";
    }
    
    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Error handling chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};