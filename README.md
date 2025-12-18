# Guide de Déploiement - HorebPay Dashboard

## Vue d'ensemble

HorebPay Dashboard est une application web pour la gestion des opérations financières. Ce guide explique comment exécuter l'application en local et la déployer sur Vercel.

---

## 1. Exécution Locale sur Votre Machine

### Prérequis
Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 16 ou supérieure) : [Télécharger ici](https://nodejs.org)
- **npm** (livré avec Node.js)
- **Git** (pour cloner le projet si nécessaire)

### Étapes d'Installation

#### Étape 1 : Cloner ou Ouvrir le Projet
```bash
# Si vous clonez depuis un repo Git :
git clone <url-du-repo>
cd HorebPay-Dashboard
```

#### Étape 2 : Installer les Dépendances
```bash
npm install
```
Cette commande télécharge toutes les librairies nécessaires (React, TypeScript, TailwindCSS, etc.).

#### Étape 3 : Configurer les Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet :
```
VITE_API_URL=https://prod.horebpay.com/horeb/api
```

#### Étape 4 : Lancer le Serveur de Développement
```bash
npm run dev
```
L'application s'ouvrira à : `http://localhost:5173`

#### Étape 5 : Connexion
- Accédez à `http://localhost:5173`
- Connectez-vous avec vos identifiants HorebPay
- Explorez le tableau de bord

### Arrêter le Serveur
Appuyez sur `Ctrl + C` dans le terminal.

---

## 2. Déploiement sur Vercel

### Avantages de Vercel
- Déploiement automatique à chaque push sur Git
- HTTPS gratuit et sécurisé
- Performance optimisée globalement
- Interface simple et intuitive

### Prérequis pour Vercel
1. **Compte GitHub** (gratuit)
2. **Compte Vercel** (gratuit) : [Créer un compte](https://vercel.com)

### Étapes de Déploiement

#### Étape 1 : Préparer le Projet Git
Assurez-vous que votre code est sur GitHub :
```bash
git add .
git commit -m "Préparation pour déploiement Vercel"
git push origin main
```

#### Étape 2 : Se Connecter à Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec votre compte GitHub

#### Étape 3 : Importer le Projet
1. Cliquez sur **"Add New Project"**
2. Sélectionnez **"Import Git Repository"**
3. Trouvez et sélectionnez le repo `HorebPay-Dashboard`
4. Cliquez sur **"Import"**

#### Étape 4 : Configurer l'Environnement
Avant de déployer, ajoutez les variables d'environnement :

1. Dans la page de configuration du projet, allez à **"Environment Variables"**
2. Ajoutez les variables suivantes :
   - **Clé** : `VITE_API_URL`
   - **Valeur** : `https://prod.horebpay.com/horeb/api`
3. Cliquez sur **"Add"** puis **"Deploy"**

#### Étape 5 : Déploiement Automatique
- Vercel construit et déploie automatiquement
- Vous recevrez une URL publique (ex: `https://horebpay-dashboard.vercel.app`)
- Chaque push sur GitHub redéploie automatiquement

### Configuration Vercel Avancée (Optionnel)

Créez un fichier `vercel.json` à la racine pour personnaliser :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://prod.horebpay.com/horeb/api"
  }
}
```

---

## 3. Commandes Importantes

```bash
# Développement en local
npm run dev

# Construire la version production
npm run build

# Prévisualiser la build production
npm run preview

# Vérifier la qualité du code
npm run lint
```

---

## 4. Dépannage

### Erreur : "Port 5173 déjà utilisé"
```bash
# Utilisez un autre port :
npm run dev -- --port 3000
```

### Erreur de Connexion à l'API
- Vérifiez que `VITE_API_URL` est correct dans `.env.local`
- Confirmez que votre connexion Internet fonctionne
- Vérifiez les logs du navigateur (F12 → Console)

### Erreur lors du Build
```bash
# Supprimez les dépendances et réinstallez :
rm -r node_modules
npm install
npm run build
```

### Vercel dit "Build Failed"
- Vérifiez que Node.js 16+ est utilisé
- Confirmez que toutes les variables d'environnement sont définies
- Consultez les logs de build sur le dashboard Vercel

---

## 5. Domaine Personnalisé (Optionnel)

Pour utiliser un domaine personnalisé sur Vercel :
1. Allez dans **"Domains"** sur le dashboard Vercel
2. Ajoutez votre domaine
3. Suivez les instructions pour mettre à jour vos enregistrements DNS

---

## 6. Sécurité

⚠️ **Important** :
- Ne jamais commiter les fichiers `.env.local`
- Gardez les tokens API confidentiels
- Utilisez Vercel pour gérer les secrets sensibles
- Activez l'authentification à deux facteurs sur GitHub et Vercel

---

## Résumé Rapide

| Action | Commande |
|--------|----------|
| Lancer en local | `npm run dev` |
| Construire production | `npm run build` |
| Déployer sur Vercel | Connectez GitHub à Vercel, importez le repo |
| Vérifier le code | `npm run lint` |

---

## Support

Pour toute question ou problème :
- Consultez la [documentation Vercel](https://vercel.com/docs)
- Vérifiez les [logs de votre projet Vercel](https://vercel.com/dashboard)
- Contactez l'équipe de développement

---

**Date de création** : Décembre 2025  
**Dernière mise à jour** : Décembre 2025
