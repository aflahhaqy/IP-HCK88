const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateOpenAIContent(prompt) {
  try {
    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: prompt,
      store: false,
    });

    return response.output_text;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateOpenAIContent,
};