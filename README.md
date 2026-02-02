# 📝 To-Do List Application

Une application web de gestion de tâches avec authentification sécurisée utilisant Supabase comme base de données.

## ✨ Fonctionnalités

### 🔐 Authentification Sécurisée
- **Inscription** avec validation d'email unique
- **Connexion** avec mot de passe hashé (bcrypt)
- **Tokens JWT** pour les sessions sécurisées
- **"Remember Me"** pour mémoriser l'email
- **Logout** et déconnexion automatique

### 📋 Gestion des Tâches
- **Créer** des tâches avec titre et priorité
- **Marquer comme terminé** avec synchronisation instantanée
- **Supprimer** des tâches avec confirmation
- **Filtrer** par statut (toutes, actives, terminées)
- **Trier** par date ou priorité
- **Statistiques** en temps réel

### 🎨 Interface Utilisateur
- **Design moderne** et responsive
- **Thème clair** avec animations fluides
- **Pas de popups** intrusifs (erreurs en console)
- **Feedback visuel** pour toutes les actions
- **Support multi-utilisateurs** avec données isolées

## 🛠️ Stack Technique

### Backend
- **Node.js** avec Express.js
- **Supabase** (PostgreSQL + API)
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **CORS** configuré pour le frontend

### Frontend
- **HTML5** sémantique
- **CSS3** moderne avec animations
- **JavaScript** vanilla (ES6+)
- **Fetch API** pour les requêtes HTTP
- **LocalStorage** pour la persistence

### Base de Données
- **PostgreSQL** via Supabase
- **Row Level Security** (RLS)
- **Relations** entre utilisateurs et tâches
- **Index** optimisés pour la performance

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- Un compte Supabase (gratuit)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd TO_DO_LIST
```

### 2. Configurer Supabase
1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans Settings > API pour obtenir vos clés
3. Exécutez le script SQL `database_setup.sql` dans l'éditeur SQL Supabase

### 3. Configurer le backend
```bash
cd BACKEND
npm install
```

Créez un fichier `.env` :
```env
# Configuration Supabase
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_anon

# Configuration serveur
PORT=5000

# Secret pour les tokens JWT
JWT_SECRET=votre_secret_jwt
```

### 4. Démarrer le serveur backend
```bash
npm start
```

### 5. Lancer le frontend
Ouvrez `FRONTEND/index.html` dans votre navigateur ou utilisez un serveur local comme Live Server.

## 📁 Structure du Projet

```
TO_DO_LIST/
├── BACKEND/
│   ├── routes/
│   │   └── auth.js          # Routes d'authentification
│   ├── server.js            # Serveur Express principal
│   ├── supabase.js          # Client Supabase
│   ├── package.json         # Dépendances backend
│   └── .env                 # Variables d'environnement
├── FRONTEND/
│   ├── index.html           # Page principale
│   ├── app.js              # Logique JavaScript
│   └── style.css           # Styles CSS
├── database_setup.sql      # Script SQL pour Supabase
└── README.md              # Ce fichier
```

## 🔧 Configuration Supabase

### Script SQL à exécuter
Le fichier `database_setup.sql` contient :

1. **Table `users`** - Stockage des utilisateurs avec mots de passe hashés
2. **Table `todos`** - Tâches liées aux utilisateurs
3. **Index** - Optimisation des performances
4. **Contraintes** - Validation des données

### Politiques de Sécurité
- Chaque utilisateur ne voit que ses propres tâches
- Accès contrôlé par tokens JWT
- Row Level Security (RLS) activé

## 🎯 Utilisation

### 1. Créer un compte
- Allez sur l'onglet "Inscription"
- Entrez votre nom, email et mot de passe
- L'email doit être unique et valide

### 2. Se connecter
- Utilisez l'onglet "Connexion"
- Cochez "Remember Me" pour mémoriser votre email
- Les tokens JWT expirent après 24h

### 3. Gérer les tâches
- **Ajouter** : Entrez un titre et choisissez la priorité
- **Terminer** : Cliquez sur la case à cocher
- **Supprimer** : Cliquez sur l'icône corbeille
- **Filtrer** : Utilisez les boutons en haut
- **Trier** : Utilisez le menu déroulant

## 🔍 Débogage

### Console du navigateur
Toutes les erreurs s'affichent dans la console (F12) :
- `=== TOGGLE START ===` : Logs détaillés du toggle
- `console.error()` : Erreurs de connexion/API
- `console.log()` : Actions réussies

### Logs du serveur
Le backend affiche des logs détaillés pour :
- Tentatives de connexion/inscription
- Opérations sur les tâches
- Erreurs de base de données

## 🛡️ Sécurité

### Authentification
- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ Tokens JWT avec expiration
- ✅ Validation d'email unique
- ✅ Pas de fallback local (plus de faux utilisateurs)

### Base de données
- ✅ Row Level Security (RLS)
- ✅ Isolation des données par utilisateur
- ✅ Contraintes d'intégrité
- ✅ Index optimisés

### API
- ✅ CORS configuré
- ✅ Validation des entrées
- ✅ Gestion des erreurs
- ✅ Pas d'exposition de données sensibles



## 🤝 Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commitez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📞 Support

Pour toute question ou problème :
- Vérifiez les logs dans la console du navigateur
- Consultez les logs du serveur backend
- Assurez-vous que Supabase est correctement configuré

---





