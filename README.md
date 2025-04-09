# PartSelect Chatbot

This project implements a specialized chatbot for the PartSelect e-commerce website. The system combines a React-based front end with a Node/Express back end that integrates with the Deepseek LLM to generate domain-specific, context-aware responses to customer queries.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Architecture Details](#architecture-details)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Working with the Chatbot](#working-with-the-chatbot)
- [Available Scripts](#available-scripts)
- [Learn More](#learn-more)

---

## Project Structure

```
PARTSELECT-CHATBOT/
├── node_modules/
├── public/
├── src/                   # React Front End
│   ├── api/
│   │   └── api.js         # Front-end API calls to the back end
│   ├── components/
│   │   └── ChatWindow.js  # Chat window UI component
│   ├── App.js
│   └── index.js
├── server/                # Node/Express Back End
│   ├── controllers/
│   │   └── chatController.js  # Handles chat requests and coordinates services
│   ├── routes/
│   │   └── chat.js             # Express router for the /chat endpoint
│   ├── services/
│   │   ├── deepseekService.js    # Integrates with the Deepseek LLM API
│   │   ├── productApiService.js  # Validates model/part number using PartSelect API endpoints
│   │   └── responseParser.js     # Parses structured Deepseek output into model and query
│   ├── .env                     # Environment variables (API keys, PORT, etc.)
│   └── index.js                 # Main entry point for the Node server
├── package.json
└── README.md
```

---

## Architecture Details

![Architecture Diagram](https://github.com/user-attachments/assets/a02ceb1b-5ef1-4b2e-985a-f8bda5cbf5d2)

### Frontend (React)

- **ChatWindow.js:**  
  Renders the real-time chat interface. Captures user input, sends the message to the back-end, and displays the chatbot response.

- **api.js:**  
  Provides utility functions (such as `getAIMessage(userQuery)`) that post the user’s message to the Node server’s `/chat` endpoint and return the server response.

### Backend (Node/Express)

- **index.js (server):**  
  The main entry point that loads environment variables via `dotenv`, sets up Express middleware (like CORS and JSON parsing), mounts the `/chat` route, and starts the server.

- **routes/chat.js:**  
  Contains the Express router that defines the `/chat` endpoint. Incoming POST requests are forwarded to the chat controller.

- **controllers/chatController.js:**  
  Orchestrates the end-to-end process:
  - Receives a chat request from the frontend.
  - Calls `deepseekService.getDeepseekResponse()` to extract structured output from the user’s message (e.g., `MODEL_NUMBER::...` and `QUERY::...`).
  - Uses `responseParser.js` to parse that output.
  - If a model/serial candidate is extracted, calls `productApiService.validateModelOrPart(candidate)` to determine whether it represents a valid model or a part number.
    - **Valid model:** A model URL is built and used with the query.
    - **Ambiguous model:** The system prompts the user for clarification.
    - **0 matches (part number):** A part URL is constructed; if access is denied, a fallback returns the candidate itself.
  - Optionally calls `deepseekService.getFinalResponseForProduct(productIdentifier, query)` to generate a final context-aware answer.
  - Returns the final response as JSON.

- **Services:**
  - **deepseekService.js:**  
    - `getDeepseekResponse(userMessage)` sends an initial system prompt to Deepseek instructing it to output two tagged lines: one for the model/serial number and one for the query.
    - `getFinalResponseForProduct(productIdentifier, query)` creates a final, context-specific response by providing the product identifier and the user query to Deepseek.
  - **productApiService.js:**  
    Checks if the candidate is a valid model number by calling PartSelect’s autocomplete API. If not, it assumes the candidate is a part number, constructs a product URL using the part search API, and returns this URL (or candidate as fallback) so that it can be passed to the final Deepseek call.
  - **responseParser.js:**  
    Parses the structured output from Deepseek into two separate properties—`modelNumber` and `query`—which the controller uses for subsequent processing.

---

## Getting Started

### Frontend Setup

In the project directory, you can run:

#### `npm install`

Installs front-end dependencies.

#### `npm start`

- Runs the React app in development mode.
- Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- The page reloads when changes are made; any lint errors will be shown in the console.

### Backend Setup

The Node/Express back-end is located in the `server/` directory.

1. **Install Backend Dependencies:**  
   From the project root, run:
   ```bash
   cd server
   npm install
   ```

2. **Set Up Environment Variables:**  
   Create a `.env` file in the `server/` directory with the following content:
   ```env
   PORT=3001
   DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY_HERE
   DEEPSEEK_API_URL=https://api.deepseek.com
   ```

3. **Run the Backend Server:**  
   From the root, run:
   ```bash
   node server/index.js
   ```
   You should see a console message:  
   `Server running on port 3001`

> ✅ **Note:** You must run both the front-end (React) and back-end (Node) concurrently for the chatbot to work properly.

---

## Working with the Chatbot

1. **User Interaction:**  
   The user types a message into the chat interface (e.g., "How can I install part number PS11752778?").

2. **Processing Flow:**  
   - The message is sent from the front-end (`api.js`) to the back-end `/chat` endpoint.
   - The back-end invokes Deepseek to parse out:
     - `MODEL_NUMBER::...`
     - `QUERY::...`
   - These are parsed and handled by the controller:
     - If a **valid model number** is identified, it generates a model-specific URL.
     - If a **valid part number**, it constructs a product-specific URL or falls back to the ID.
     - If multiple model suggestions are returned, the bot asks the user to clarify.
   - Final product information (if available) and the query are passed to Deepseek, which responds accordingly.

3. **Final Response:**  
   The chatbot gives a response tailored to the specific product or model + the user's question.

---

## Available Scripts (Frontend)

### `npm start`

Launches the React frontend at [http://localhost:3000](http://localhost:3000)

### `npm test`

Runs frontend test suite

### `npm run build`

Creates an optimized production build

### `npm run eject`

Use cautiously—copies all config dependencies locally

---

## Learn More

- React: https://reactjs.org/
- Create React App: https://facebook.github.io/create-react-app/docs/getting-started
- Express: https://expressjs.com/
- Deepseek API: https://deepseek.com/

---
