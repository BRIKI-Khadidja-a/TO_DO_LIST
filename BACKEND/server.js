require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./supabase");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Middleware: verify user
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: "Unauthorized" });
  req.user = data.user;
  next();
}

// GET TODOS
app.get("/api/todos", authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", req.user.id);
  if (error) return res.status(500).json(error);
  res.json(data);
});

// ADD TODO
app.post("/api/todos", authMiddleware, async (req, res) => {
  const { title, priority } = req.body;
  const { data, error } = await supabase
    .from("todos")
    .insert({ title, priority: priority || 'medium', user_id: req.user.id });
  if (error) return res.status(500).json(error);
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
