// src/api/api.js
export const getAIMessage = async (userQuery) => {
  try {
    const res = await fetch("http://localhost:3001/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userQuery }),
    });

    const data = await res.json();
    return {
      role: "assistant",
      content: data.response,
    };
  } catch (error) {
    console.error("Error fetching the AI message:", error);
    return {
      role: "assistant",
      content: "Sorry, there was an error contacting the server.",
    };
  }
};
