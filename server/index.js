import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import revolutRouter from "./routes/revolut.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("ENV CHECK:", {
  secret: process.env.REVOLUT_SECRET_KEY?.slice(0, 15),
  public: process.env.REVOLUT_PUBLIC_KEY?.slice(0, 15),
})

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/revolut", revolutRouter);

app.get("/api/products", async (req, res) => {
  try {
    const base = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });

    const baseData = await base.json();

    // 🔥 fetch full product details (with price)
    const productsWithDetails = await Promise.all(
      baseData.result.map(async (item) => {
        const detailRes = await fetch(
          `https://api.printful.com/store/products/${item.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`
            }
          }
        );

        const detailData = await detailRes.json();

        return {
          ...item,
          variants: detailData.result?.sync_variants || []
        };
      })
    );

    res.json({ result: productsWithDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.listen(3001, () => {
  console.log("✅ Server running on http://localhost:3001");
});