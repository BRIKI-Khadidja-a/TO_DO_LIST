require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const supabase = require("./supabase");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'file://'],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

// Middleware: verify user
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Unauthorized", message: "Token manquant" });
  }
  
  try {
    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Récupérer l'utilisateur depuis la table users
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, created_at")
      .eq("id", decoded.userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erreur recherche utilisateur:', error);
      return res.status(500).json({ error: "Database error", message: "Erreur base de données" });
    }
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", message: "Utilisateur non trouvé" });
    }
    
    req.user = user;
    req.user.isLocal = false;
    next();
    
  } catch (jwtError) {
    console.error('Erreur token JWT:', jwtError);
    return res.status(401).json({ error: "Unauthorized", message: "Token invalide" });
  }
}

// GET TODOS
app.get("/api/todos", authMiddleware, async (req, res) => {
  // Uniquement utiliser Supabase
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error('Erreur récupération todos:', error);
    return res.status(500).json(error);
  }
  
  res.json(data);
});

// ADD TODO
app.post("/api/todos", authMiddleware, async (req, res) => {
  const { title, priority } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  
  // Uniquement utiliser Supabase
  const { data, error } = await supabase
    .from("todos")
    .insert({ 
      title, 
      priority: priority || 'medium', 
      user_id: req.user.id 
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erreur ajout todo:', error);
    return res.status(500).json(error);
  }
  
  res.json(data);
});

// UPDATE TODO
app.put("/api/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { completed, title, priority } = req.body;
  
  const updateData = {};
  if (completed !== undefined) updateData.completed = completed;
  if (title !== undefined) updateData.title = title;
  if (priority !== undefined) updateData.priority = priority;
  updateData.updated_at = new Date().toISOString();

  // Uniquement utiliser Supabase
  const { data, error } = await supabase
    .from("todos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur mise à jour todo:', error);
    return res.status(500).json(error);
  }
  
  if (!data) {
    return res.status(404).json({ error: "Todo not found" });
  }
  
  res.json(data);
});

// DELETE TODO
app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  // Uniquement utiliser Supabase
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur suppression todo:', error);
    return res.status(500).json(error);
  }
  
  if (!data) {
    return res.status(404).json({ error: "Todo not found" });
  }
  
  res.json({ message: "Todo deleted successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
