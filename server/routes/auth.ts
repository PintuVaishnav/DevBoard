import express from "express";
import { getUserById, createUser } from "../services/userService";

const router = express.Router();

router.get("/user", async (req, res) => {
  try {
    const userData = req.user || req.session?.user || req.body?.user; // adjust based on your flow

    if (!userData?.email) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    let user = await getUserById(userData.email);

    if (!user) {
      user = await createUser({
        name: userData.name || "Anonymous",
        email: userData.email,
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
