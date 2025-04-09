// server/services/productApiService.js
const axios = require("axios");

/**
 * Validate the provided candidate using the model autocomplete API.
 * If matches are found, return a structured response for a model.
 * If no matches are found, assume the candidate is a part number and try to retrieve the part page URL.
 *
 * @param {string} candidate - The model or part number candidate.
 * @returns {Object} - An object with properties:
 *                    - type: 'model' | 'part'
 *                    - status: 'valid', 'ambiguous', 'too_many', or 'not_found'
 *                    - For model: { model } or { options }
 *                    - For part: { url }
 */
async function validateModelOrPart(candidate) {
  // First try the model autocomplete API.
  const modelUrl = `https://www.partselect.com/api/Search/AutoCompleteModels?searchTerm=${encodeURIComponent(candidate)}&numResults=6`;
  try {
    const response = await axios.get(modelUrl);
    const data = response.data;
    const matches = data.matches;
    const items = data.items;
    if (matches > 0 && items && Object.keys(items).length > 0) {
      const candidateModels = Object.values(items);
      if (candidateModels.length === 1) {
        return { type: "model", status: "valid", model: candidateModels[0] };
      } else if (candidateModels.length > 1 && candidateModels.length < 5) {
        return { type: "model", status: "ambiguous", options: candidateModels };
      } else if (candidateModels.length >= 5) {
        return { type: "model", status: "too_many", options: candidateModels };
      }
    }
    // If we have no matches for a model, we assume candidate might be a part number.
    return await getPartUrl(candidate);
  } catch (error) {
    console.error("Error in model validation:", error.response?.data || error);
    // Treat errors as not found.
    return { type: "unknown", status: "not_found" };
  }
}

/**
 * Retrieve the part URL given a part number candidate.
 * This function calls the part search API URL.
 *
 * @param {string} partCandidate - The candidate part number.
 * @returns {Object} - An object with type 'part' and a status and URL if found.
 */
async function getPartUrl(partCandidate) {
  const url = `https://www.partselect.com/api/search/?searchterm=${encodeURIComponent(partCandidate)}`;
  try {
    // By default axios follows redirects. After the request completes,
    // we attempt to read the final URL from the underlying Node response.
    const response = await axios.get(url);
    // In many Node environments, axios attaches the final URL
    // to response.request.res.responseUrl.
    if (response.request && response.request.res && response.request.res.responseUrl) {
      return { type: "part", status: "valid", url: response.request.res.responseUrl };
    }
    return { type: "part", status: "not_found" };
  } catch (error) {
    console.error("Error fetching part URL:", error.response?.data || error);
    return { type: "part", status: "not_found" };
  }
}

module.exports = {
  validateModelOrPart,
};
