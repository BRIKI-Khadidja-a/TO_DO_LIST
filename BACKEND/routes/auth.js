const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Tentative d\'inscription:', { name, email });
  
  try {
    // Vérifier si l'email existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    console.log('Résultat recherche utilisateur:', { existingUser, checkError });
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur vérification email:', checkError);
      return res.status(500).json({ 
        error: "Database error",
        message: "Erreur lors de la vérification de l'email" 
      });
    }
    
    if (existingUser) {
      console.log('Email déjà utilisé:', email);
      return res.status(400).json({ 
        error: "Email already exists",
        message: "Cet email est déjà utilisé" 
      });
    }
    
    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Tentative d\'insertion utilisateur...');
    
    // Insérer le nouvel utilisateur
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        name,
        password_hash: passwordHash
      })
      .select()
      .single();
    
    console.log('Résultat insertion:', { newUser, insertError });
    
    if (insertError) {
      console.error('Erreur insertion utilisateur:', insertError);
      return res.status(500).json({ 
        error: "Registration failed",
        message: "L'inscription a échoué: " + insertError.message 
      });
    }
    
    if (!newUser) {
      console.error('Insertion a retourné null');
      return res.status(500).json({ 
        error: "Registration failed",
        message: "L'inscription a échoué - aucune donnée retournée" 
      });
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    console.log('Inscription réussie pour:', email);
    res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Erreur serveur lors de l'inscription: " + error.message 
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Rechercher l'utilisateur par email
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, email, name, password_hash, created_at")
      .eq("email", email)
      .maybeSingle();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Erreur recherche utilisateur:', findError);
      return res.status(500).json({ 
        error: "Database error",
        message: "Erreur lors de la recherche de l'utilisateur" 
      });
    }
    
    if (!user) {
      return res.status(400).json({ 
        error: "Invalid credentials",
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: "Invalid credentials",
        message: "Email ou mot de passe incorrect" 
      });
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    console.log('Login réussi pour:', email);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Erreur serveur lors de la connexion" 
    });
  }
});

module.exports = router;
