const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json(error);
  res.json(data);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json(error);
  res.json(data);
});

module.exports = router;
