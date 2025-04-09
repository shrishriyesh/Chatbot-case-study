// server/services/productApiService.js
const axios = require("axios");

/**
 * Verify the model number using the PartSelect Autocomplete API.
 *
 * @param {string} modelNumber - The extracted model/serial number to validate.
 * @returns {Object} - An object describing the status and possibly the candidate options.
 *                     Possible statuses:
 *                        - valid: exactly 1 match found.
 *                        - ambiguous: more than one but less than 5 matches.
 *                        - too_many: more than 5 matches.
 *                        - not_found: no matches.
 */
async function validateModelNumber(modelNumber) {
  try {
    const url = `https://www.partselect.com/api/Search/AutoCompleteModels?searchTerm=${encodeURIComponent(
      modelNumber
    )}&numResults=6`;

    const response = await axios.get(url);
    const data = response.data;
    
    // Assume data has two properties:
    // "matches": number of matches, and "items": an object mapping IDs to model numbers.
    const matches = data.matches;
    const items = data.items;
    
    if (matches === 0 || !items) {
      return { status: "not_found", options: [] };
    }
    
    // Convert items object into an array of values.
    const candidateModels = Object.values(items);
    
    if (matches === 1 || candidateModels.length === 1) {
      // Exactly one valid match; model is confirmed.
      return { status: "valid", model: candidateModels[0] };
    } else if (matches > 1 && matches < 5) {
      // Ambiguous: few matches – let the user choose.
      return { status: "ambiguous", options: candidateModels };
    } else if (matches >= 5) {
      // Too many matches.
      return { status: "too_many", options: candidateModels };
    } else {
      // Fallback if none of the conditions match.
      return { status: "not_found", options: [] };
    }
  } catch (error) {
    console.error("Error validating model number:", error.response?.data || error);
    // In case of an error, treat it as not found or propagate the error as needed.
    return { status: "not_found", options: [] };
  }
}

module.exports = {
  validateModelNumber,
};
