// server/controllers/chatController.js
const deepseekService = require('../services/deepseekService');
const { parseDeepseekResponse } = require('../services/responseParser');
const { validateModelOrPart } = require('../services/productApiService');

// Placeholder handler for query-only responses.
const handleQueryOnly = async (query) => {
  return `Received your query: "${query}" without any product identifiers.`;
};

// Handlers for each scenario.
const handleValidModel = async (model, query) => {
  // Here you would normally scrape product details by constructing a model URL,
  // then pass these details along with the query to a contextual Deepseek call.
  return `Validated model: ${model}. Proceeding with your query: "${query}" using the model URL.`;
};

const handleAmbiguousModel = async (options) => {
  return `Multiple possible models found: ${options.join(", ")}. Please clarify your model number.`;
};

const handleTooManyMatches = async () => {
  return "Too many model matches found. Please provide a more specific model number.";
};

const handlePartValid = async (url, query) => {
  // Use the part URL (from the part search API) along with the query.
  return `Validated part found at: ${url}. Proceeding with your query: "${query}" using the part details.`;
};

const handleNotFound = async () => {
  return "No valid model or part number was found. Please check your input.";
};

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided." });
    
    // Get structured response from Deepseek.
    const deepseekRawResponse = await deepseekService.getDeepseekResponse(message);
    
    // Parse the Deepseek response into two parts.
    const { modelNumber, query } = parseDeepseekResponse(deepseekRawResponse);
    
    let finalResponse = "";
    
    // If we got a candidate (modelNumber from Deepseek is not "NONE")
    if (modelNumber !== "NONE") {
      const validation = await validateModelOrPart(modelNumber);
      if (validation.type === "model") {
        // Handle based on the status of model validation.
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
      // If no product identifier was parsed but a query exists.
      finalResponse = await handleQueryOnly(query);
    } else {
      finalResponse = "Please provide a valid model or part number, or ask your question clearly.";
    }
    
    res.json({ response: finalResponse });
  } catch (error) {
    console.error("Error handling chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
