// server/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Loads environment variables from .env file
console.log("API KEY from .env is:", process.env.DEEPSEEK_API_KEY);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use the /chat route for chat-related requests
app.use('/chat', chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
