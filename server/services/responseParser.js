// server/services/responseParser.js
module.exports.parseDeepseekResponse = (responseText) => {
    // Split the response by newline and trim each line.
    const lines = responseText.trim().split('\n');
    let modelNumber = 'NONE';
    let query = 'NONE';
    
    for (const line of lines) {
      if (line.startsWith("MODEL_NUMBER::")) {
        modelNumber = line.split("MODEL_NUMBER::")[1].trim();
      } else if (line.startsWith("QUERY::")) {
        query = line.split("QUERY::")[1].trim();
      }
    }
    
    return { modelNumber, query };
  };
  