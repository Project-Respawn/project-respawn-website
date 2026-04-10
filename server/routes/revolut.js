import express from "express";
const router = express.Router();

const REVOLUT_API_BASE = "https://sandbox-merchant.revolut.com/api/1.0";

router.get("/config", (_req, res) => {
  const REVOLUT_PUBLIC_KEY = process.env.REVOLUT_PUBLIC_KEY;
  console.log("Public key loaded:", REVOLUT_PUBLIC_KEY?.slice(0, 10));
  res.json({ publicKey: REVOLUT_PUBLIC_KEY });
});

router.post("/order", async (req, res) => {
  const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY;
  console.log("Secret key loaded:", REVOLUT_SECRET_KEY?.slice(0, 10));

  if (!REVOLUT_SECRET_KEY) {
    console.error("Revolut secret key is missing. Check server/.env and how the server is started.");
    return res.status(500).json({ error: "Server configuration error: missing Revolut secret key." });
  }

  try {
    const { amount, currency = "GBP", description, customer_email } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const response = await fetch(`${REVOLUT_API_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REVOLUT_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: currency.toUpperCase(),
        description: description || "Project Respawn Merch Order",
        customer_email: customer_email,
        save_payment_method: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Revolut error:", err);
      return res.status(502).json({ error: "Payment provider error", detail: err });
    }

    const order = await response.json();
    res.json({ publicId: order.public_id, orderId: order.id });
  } catch (error) {
    console.error("Revolut order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;