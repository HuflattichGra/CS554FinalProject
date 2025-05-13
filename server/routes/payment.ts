import { Router, Request, Response } from "express";
import userData from "../src/users";
import { checkId } from "../typechecker.js";
import client from "../redis/client.js";

const router = Router();

// Add balance to a user's account
router.post("/addBalance", async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Error: User not logged in" });
    }

    const { cardNumber, cardHolder, expiryDate, cvv, amount } = req.body;

    // Validate payment information
    if (!cardNumber || typeof cardNumber !== "string") {
      return res.status(400).json({ error: "Invalid card number" });
    }

    // Remove spaces and check length
    const cardNumberTrimmed = cardNumber.replace(/\s/g, "");
    if (cardNumberTrimmed.length !== 16 || !/^\d+$/.test(cardNumberTrimmed)) {
      return res.status(400).json({ error: "Card number must be 16 digits" });
    }

    if (
      !cardHolder ||
      typeof cardHolder !== "string" ||
      cardHolder.trim().length < 3
    ) {
      return res
        .status(400)
        .json({ error: "Card holder name must be at least 3 characters" });
    }

    if (
      !expiryDate ||
      typeof expiryDate !== "string" ||
      !expiryDate.match(/^\d{2}\/\d{2}$/)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid expiry date format (MM/YY)" });
    }
    // Validate expiry date is in the future
    const [month, year] = expiryDate.split("/");
    const monthNum = parseInt(month);

    // Validate month is between 01 and 12
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Month must be between 01 and 12" });
    }

    const expiryDateObj = new Date(2000 + parseInt(year), monthNum - 1, 1);
    const today = new Date();
    if (expiryDateObj < today) {
      return res.status(400).json({ error: "Card has expired" });
    }

    if (
      !cvv ||
      typeof cvv !== "string" ||
      cvv.length !== 3 ||
      !/^\d+$/.test(cvv)
    ) {
      return res.status(400).json({ error: "Invalid CVV" });
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Set a reasonable limit for a single transaction
    const amountValue = parseFloat(amount);
    if (amountValue > 10000) {
      return res
        .status(400)
        .json({ error: "Amount exceeds maximum limit of $10,000" });
    } // In a real application, we would handle the payment processing here
    // For this fake implementation, we'll just add the amount to the user's balance

    const userId = req.session.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid user session" });
    }

    // Update user with new balance
    const user = await userData.updateUser(userId, {
      balance: amountValue,
    });

    // Clear cache for this user
    await client.del("user:" + userId);

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      user,
    });
  } catch (e: any) {
    return res.status(400).json({ error: e.toString() });
  }
});

export default router;
