require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const UserController = require("./controllers/userController");
// Note: load OpenAI helper at runtime inside handlers to allow tests to mock it
const customerRoutes = require("./routes/customer");
const staffRoutes = require("./routes/staff");
const paymentRoutes = require("./routes/payment");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", UserController.home);
app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/login/google", UserController.googleLogin);

// Payment routes (Midtrans webhook)
app.use("/", paymentRoutes);

// Public endpoint for products (accessible without authentication)
// app.get("/products", UserController.home);

app.get("/generate", async (req, res) => {
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const { generateOpenAIContent } = require("./helpers/openai.lib");
    const openAIContent = await generateOpenAIContent(prompt);
    res.json({ openAIContent });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.get("/recommendations", async (req, res) => {
  try {
    // Load products from products.json
    const products = require("./products.json");

    // Determine time of day
    const currentHour = new Date().getHours();
    let timeOfDay;
    let timeContext;

    if (currentHour >= 5 && currentHour < 12) {
      timeOfDay = "pagi";
      timeContext = "untuk memulai hari dengan energi penuh";
    } else if (currentHour >= 12 && currentHour < 18) {
      timeOfDay = "siang";
      timeContext =
        "untuk menemani aktivitas siang hari atau istirahat sejenak";
    } else {
      timeOfDay = "malam";
      timeContext = "untuk bersantai di malam hari tanpa mengganggu tidur";
    }

    // Create prompt for AI
    const productList = products
      .map((p, i) => `${i + 1}. ${p.name} - Rp${p.price.toLocaleString()}`)
      .join("\n");

    const prompt = `You are a coffee expert barista. It is currently ${timeOfDay} time (${currentHour}:00).

Based on the following coffee menu, recommend 3 drinks that are perfect for ${timeOfDay} ${timeContext}.

For PAGI (morning): Recommend energizing drinks with higher caffeine to start the day.
For SIANG (afternoon): Recommend balanced drinks that refresh without being too heavy.
For MALAM (evening/night): Recommend lighter drinks or those with less caffeine, or sweet/dessert-style drinks.

Available Coffee Menu:
${productList}

IMPORTANT: You MUST pick the product names EXACTLY as they appear in the menu above. Do not create new names.

Please provide your recommendations in this exact JSON array format (just the array, no additional text):
[
  {
    "name": "Exact Product Name from menu",
  }
]`;

    const { generateOpenAIContent } = require("./helpers/openai.lib");
    const aiResponse = await generateOpenAIContent(prompt);

    // Parse AI response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiRecommendations = JSON.parse(jsonMatch[0]);

      // Map AI recommendations with full product details
      const recommendations = aiRecommendations
        .map((rec, index) => {
          const product = products.find((p) => p.name === rec.name);
          if (product) {
            return {
              id: index + 1,
              name: product.name,
              price: `Rp${product.price.toLocaleString("id-ID")}`,
              imgUrl: product.imageUrl,
              category: product.name.includes("Frappuccino")
                ? "Frappuccino"
                : product.name.includes("Latte")
                ? "Latte"
                : product.name.includes("Cold Brew") ||
                  product.name.includes("Iced")
                ? "Iced"
                : "Coffee",
              reason: rec.reason,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      res.json(recommendations);
    } else {
      // Fallback if AI doesn't return proper JSON
      const fallbackProducts = products.slice(0, 3).map((p, index) => ({
        id: index + 1,
        name: p.name,
        price: `Rp${p.price.toLocaleString("id-ID")}`,
        imgUrl: p.imageUrl,
        category: "Coffee",
        reason: `Great choice for ${timeOfDay}!`,
      }));

      res.json(fallbackProducts);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Staff routes (protected) - mounted at /staff
// ⚠️ MUST come before customer routes to avoid being intercepted!
app.use("/staff", staffRoutes);

// Customer routes (protected)
app.use("/", customerRoutes);

// Error handler middleware
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    status = 400;
    message = err.errors.map((e) => e.message).join(", ");
  } else if (err.name === "UnauthorizedError") {
    status = 401;
  } else if (err.name === "ForbiddenError") {
    status = 403;
  } else if (err.name === "NotFoundError") {
    status = 404;
  }

  res.status(status).json({ error: message });
});

// Export app untuk testing
module.exports = app;

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
