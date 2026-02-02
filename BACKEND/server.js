require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./supabase");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Stockage local pour les utilisateurs locaux
const localTodos = {};

// Middleware: verify user
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  // Vérifier si c'est un token local
  if (token && token.startsWith('local_token_')) {
    // Créer un utilisateur fake à partir du token
    const userId = token.replace('local_token_', '');
    req.user = {
      id: `local_${userId}`,
      email: 'local_user@example.com',
      name: 'Local User',
      isLocal: true
    };
    return next();
  }
  
  // Authentification Supabase normale
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: "Unauthorized" });
  req.user = data.user;
  req.user.isLocal = false;
  next();
}

// GET TODOS
app.get("/api/todos", authMiddleware, async (req, res) => {
  if (req.user.isLocal) {
    // Utiliser le stockage local
    const userTodos = localTodos[req.user.id] || [];
    return res.json(userTodos);
  }
  
  // Utiliser Supabase
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
  
  if (req.user.isLocal) {
    // Utiliser le stockage local
    if (!localTodos[req.user.id]) {
      localTodos[req.user.id] = [];
    }
    
    const newTodo = {
      id: Date.now().toString(),
      title,
      priority: priority || 'medium',
      completed: false,
      user_id: req.user.id,
      created_at: new Date().toISOString()
    };
    
    localTodos[req.user.id].push(newTodo);
    return res.json(newTodo);
  }
  
  // Utiliser Supabase
  const { data, error } = await supabase
    .from("todos")
    .insert({ title, priority: priority || 'medium', user_id: req.user.id });
  if (error) return res.status(500).json(error);
  res.json(data);
});

// UPDATE TODO (marquer comme terminée)
app.put("/api/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { completed, title, priority } = req.body;
  
  if (req.user.isLocal) {
    // Utiliser le stockage local
    const userTodos = localTodos[req.user.id] || [];
    const todo = userTodos.find(t => t.id === id);
    
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    if (completed !== undefined) todo.completed = completed;
    if (title !== undefined) todo.title = title;
    if (priority !== undefined) todo.priority = priority;
    todo.updated_at = new Date().toISOString();
    
    return res.json(todo);
  }
  
  // Utiliser Supabase
  const updateData = {};
  if (completed !== undefined) updateData.completed = completed;
  if (title !== undefined) updateData.title = title;
  if (priority !== undefined) updateData.priority = priority;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("todos")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", req.user.id);
  
  if (error) return res.status(500).json(error);
  res.json(data);
});

// DELETE TODO
app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  if (req.user.isLocal) {
    // Utiliser le stockage local
    const userTodos = localTodos[req.user.id] || [];
    const index = userTodos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    userTodos.splice(index, 1);
    return res.json({ message: "Todo deleted successfully" });
  }
  
  // Utiliser Supabase
  const { data, error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id);
  
  if (error) return res.status(500).json(error);
  res.json({ message: "Todo deleted successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
