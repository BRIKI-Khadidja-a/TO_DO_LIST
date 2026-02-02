# 📝 To-Do List - Application de Gestion de Tâches

## 📖 Description

Application complète de gestion de tâches (To-Do List) développée dans le cadre universitaire pour appliquer les concepts de développement web full-stack.

**Objectif:** Créer un site web complet avec frontend et backend, incluant l'authentification et la persistance des données.

## ✨ Fonctionnalités Implémentées

### 🔐 Authentification
- ✅ Système login/register avec interface claire
- ✅ Stockage sécurisé des mots de passe (bcrypt)
- ✅ Authentification JWT
- ✅ Session persistante (localStorage)
- ✅ Bouton déconnexion avec reset des données

### 📋 Gestion des Tâches
- ✅ Ajouter une tâche (Entrée ou bouton)
- ✅ Modifier chaque tâche (édition inline)
- ✅ Supprimer une tâche
- ✅ Marquer comme terminée/active
- ✅ Persistance des données via backend Express
- ✅ API REST complète (GET, POST, PUT, DELETE)
- ✅ Interface dynamique (DOM + Fetch API)

### 🎨 Fonctionnalités Bonus
- ✅ **Filtrage:** Tous / Actives / Terminées
- ✅ **Tri:** Par date, priorité ou titre
- ✅ **Badges de priorité:** Haute (🔴), Moyenne (🟡), Basse (🟢)
- ✅ **Dashboard:** Statistiques en temps réel
- ✅ **Design moderne:** Gradients, ombres, animations
- ✅ **Responsive:** Compatible mobile/tablette/desktop

## 🛠️ Technologies

### Frontend
- HTML5
- CSS3 (Variables CSS, Grid, Flexbox, Animations)
- JavaScript Vanilla (ES6+)
- Fetch API

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14+)
- MongoDB (installé et démarré)

### Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd TO_DO_LIST
```

2. **Installer les dépendances**
```bash 
cd backend
npm install
cd ..
```

3. **Démarrer MongoDB**
```bash
# Linux/Mac
sudo systemctl start mongodb
# ou
sudo systemctl start mongod

# Vérifier que MongoDB fonctionne
sudo systemctl status mongodb
```

4. **Lancer le serveur backend**
```bash
cd backend
npm start
# Le serveur démarre sur http://localhost:5000
```

5. **Ouvrir le frontend**
- Double-cliquer sur `index.html`
- Ou utiliser un serveur HTTP local:
```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js http-server
npx http-server -p 8080

# Puis ouvrir http://localhost:8080
```

### Script de démarrage rapide
```bash
./start.sh
```

## 📁 Structure du Projet

```
TO_DO_LIST/
├── index.html              # Page principale
├── style.css               # Styles CSS
├── app.js                  # Logique frontend
├── start.sh               # Script de démarrage (optionnel)
├── README.md              # Documentation
└── backend/
    ├── server.js         # Serveur Express
    ├── package.json      # Dépendances
    ├── models/
    │   ├── user.js      # Modèle utilisateur
    │   └── todo.js      # Modèle tâche
    ├── routes/
    │   ├── auth.js      # Routes authentification
    │   └── todos.js     # Routes tâches
    └── middleware/
        └── auth.js      # Middleware JWT
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription (body: name, email, password)
- `POST /api/auth/login` - Connexion (body: email, password)

### Tâches (nécessite authentification)
- `GET /api/todos` - Récupérer toutes les tâches
- `POST /api/todos` - Créer une tâche (body: title, priority)
- `PUT /api/todos/:id` - Modifier une tâche (body: title, completed, priority)
- `DELETE /api/todos/:id` - Supprimer une tâche

## 💡 Utilisation

1. **Inscription/Connexion**
   - Ouvrir l'application
   - S'inscrire avec nom, email et mot de passe
   - Ou se connecter si compte existant

2. **Ajouter une tâche**
   - Entrer le titre dans le champ
   - Choisir la priorité (Basse/Moyenne/Haute)
   - Appuyer sur Entrée ou cliquer "Ajouter"

3. **Gérer les tâches**
   - Cocher pour marquer comme terminée
   - Cliquer ✏️ pour modifier
   - Cliquer 🗑️ pour supprimer

4. **Filtrer et trier**
   - Utiliser les boutons de filtre (Tous/Actives/Terminées)
   - Choisir le tri (Date/Priorité/Titre)

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
sudo systemctl restart mongodb
sudo systemctl status mongodb
```

### Port 5000 déjà utilisé
Modifier le port dans `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

### Erreur CORS
Vérifier que l'URL de l'API dans `app.js` correspond au serveur:
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Les tâches ne s'affichent pas
1. Vérifier que le serveur backend est démarré
2. Ouvrir la console du navigateur (F12) pour voir les erreurs
3. Vérifier que MongoDB fonctionne

## 🎯 Objectifs Pédagogiques

Ce projet permet de pratiquer:
- ✅ Manipulation du DOM
- ✅ Requêtes asynchrones (Fetch API)
- ✅ Authentification JWT
- ✅ API REST (CRUD complet)
- ✅ MongoDB et Mongoose
- ✅ Express.js et middleware
- ✅ CSS moderne
- ✅ Sécurité web

## 📝 Améliorations Futures

- [ ] Dates d'échéance pour les tâches
- [ ] Catégories/tags
- [ ] Recherche de tâches
- [ ] Export/Import de données
- [ ] Mode sombre
- [ ] Notifications
- [ ] Partage de tâches entre utilisateurs

## 📅 Timeline

- **Start:** 24-10-2025 (HTML - 15min)
- **Week 5:** Déploiement
- **Deadlines:** Selon les cours de Monsieur Boubenia

## 🎨 Design

Design inspiré de: https://claude.ai/public/artifacts/9f8ef8ea-eef3-405c-a0fe-3f9723d9d02a

## 📝 Niveau

⭐⭐⭐⭐ Intermédiaire-Avancé

## 🎉 GOOD LUCK!







