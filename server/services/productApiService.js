// server/services/productApiService.js
const axios = require("axios");

/**
 * Build a URL for a valid model.
 * Modify this function to match the pattern of model pages on PartSelect.
 *
 * @param {string} model - The validated model number.
 * @returns {string} - The constructed model URL.
 */
function buildModelUrl(model) {
  // Adjust this URL pattern based on your site's structure.
  return `https://www.partselect.com/models/${model}`;
}

/**
 * Validate the provided candidate using the model autocomplete API.
 * If matches are found, return a structured response for a model.
 * If no matches are found, assume the candidate is a part number and
 * return the constructed part search URL.
 *
 * @param {string} candidate - The model or part number candidate.
 * @returns {Object} - An object with properties:
 *                    - type: 'model' | 'part'
 *                    - status: 'valid', 'ambiguous', 'too_many', or 'not_found'
 *                    - For model: if valid, { model, modelUrl }; if ambiguous/too_many, { options }
 *                    - For part: { url } when valid.
 */
async function validateModelOrPart(candidate) {
  const modelUrlEndpoint = `https://www.partselect.com/api/Search/AutoCompleteModels?searchTerm=${encodeURIComponent(candidate)}&numResults=6`;
  try {
    const response = await axios.get(modelUrlEndpoint);
    const data = response.data;
    const matches = data.matches;
    const items = data.items;
    
    if (matches > 0 && items && Object.keys(items).length > 0) {
      const candidateModels = Object.values(items);
      
      if (candidateModels.length === 1) {
        // Valid model found—build and return the model URL.
        const model = candidateModels[0];
        const modelUrl = buildModelUrl(model);
        return { type: "model", status: "valid", model, modelUrl };
      } else if (candidateModels.length > 1 && candidateModels.length < 5) {
        return { type: "model", status: "ambiguous", options: candidateModels };
      } else if (candidateModels.length >= 5) {
        return { type: "model", status: "too_many", options: candidateModels };
      }
    }
    // No model matches: assume candidate is a part number.
    return await getPartUrl(candidate);
  } catch (error) {
    console.error("Error in model validation:", error.response?.data || error);
    // Treat errors as not found by assuming it is a part number.
    return await getPartUrl(candidate);
  }
}

/**
 * Retrieve the part URL given a part number candidate.
 * This function constructs the part URL using the candidate.
 * It attempts to perform an axios GET to follow redirects, but if
 * this fails or access is denied, it returns the constructed URL.
 *
 * @param {string} partCandidate - The candidate part number.
 * @returns {Object} - An object with type 'part' and, on success, status 'valid' and { url }.
 */
async function getPartUrl(partCandidate) {
  // Construct the part URL endpoint using the candidate.
  const partUrlEndpoint = `https://www.partselect.com/api/search/?searchterm=${encodeURIComponent(partCandidate)}`;
  try {
    // Attempt to follow redirects.
    const response = await axios.get(partUrlEndpoint, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                      "AppleWebKit/537.36 (KHTML, like Gecko) " +
                      "Chrome/115.0.0.0 Safari/537.36",
        "Referer": "https://www.partselect.com/"
      },
      maxRedirects: 5
    });
    if (response.request && response.request.res && response.request.res.responseUrl) {
      return { type: "part", status: "valid", url: response.request.res.responseUrl };
    }
    // Fallback: return the constructed part URL.
    return { type: "part", status: "valid", url: partUrlEndpoint };
  } catch (error) {
    console.error("Error fetching part URL:", error.response?.data || error);
    // In case of error (e.g. Access Denied), return the constructed part URL.
    return { type: "part", status: "valid", url: partUrlEndpoint };
  }
}

module.exports = {
  validateModelOrPart,
};