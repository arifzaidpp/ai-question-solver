import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.kluster.ai/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Process question endpoint
app.post('/api/process-question', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    console.log("Text: ",text)

    // Format the prompt for better results
    const prompt = `
      Analyze the following text which contains a question and possibly multiple choice options:
      
      ${text}
      
      Please provide:
      1. The correct answer
      2. A brief explanation of why it's correct
      
      Format your response as:
      Answer: [Your answer]
      Explanation: [Your explanation]
    `;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'klusterai/Meta-Llama-3.3-70B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant specialized in answering academic questions accurately and concisely.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = response.data.choices[0].message.content;
    console.log(response.data.choices[0].message);
    res.json({ answer });
  } catch (error) {
    console.error('Error processing question:', error);
    
    // Send appropriate error response
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded' });
    } else {
      res.status(500).json({ error: 'Failed to process the question' });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});