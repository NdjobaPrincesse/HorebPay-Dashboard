
#  Documentation Technique & Guide de Déploiement - HorebPay Dashboard

## Vue d'ensemble
Le Dashboard HorebPay est une application React conçue pour offrir une visualisation en temps réel des transactions et la gestion des clients. Elle se connecte à l'API Spring Boot via un système de **Proxy intelligent** pour contourner les problèmes de sécurité (CORS) entre le Frontend et le Backend.

---

## 1. Architecture du Code (Pour comprendre et modifier)

Le code est structuré de manière modulaire pour faciliter la maintenance. Nous n'avons pas un fichier unique géant, mais une séparation logique.

###  Structure des Dossiers
```text
src/
├── api/                # CŒUR DU SYSTÈME (Communication Backend)
│   ├── auth.ts         # Gère le Login (envoie userName/password) et le Logout
│   └── axios.ts        # Configuration HTTP globale (URL de base, Token automatique)
│
├── components/         # ÉLÉMENTS VISUELS (Briques LEGO)
│   ├── TransactionReceipt.tsx  # Le reçu/ticket (Design Fintech)
│   ├── LogoutModal.tsx         # La fenêtre de confirmation de déconnexion
│   └── ...
│
├── pages/              # LES ÉCRANS
│   ├── Dashboard.tsx   # L'écran principal (Tableaux, Filtres, Calculs Revenus)
│   └── LoginPage.tsx   # L'écran de connexion
│
└── index.css           # Styles globaux et configuration d'impression (Media Queries)
```

###  "Où est le fichier API ?"
Il n'y a pas un seul fichier, mais deux fichiers critiques dans le dossier `src/api/` :
1.  **`axios.ts`** : C'est le "tuyau". Il configure l'intercepteur qui ajoute automatiquement le `Bearer Token` à chaque requête.
2.  **`auth.ts`** : C'est la "clé". Il contient la logique spécifique pour l'endpoint `/users/login`.

Toutes les autres requêtes (Transactions, Clients) sont faites directement dans `Dashboard.tsx` via `api.get('/transactions')`.

---

## 2. Exécution Locale (Développement)

Le projet utilise **Vite** avec une configuration de Proxy pour rediriger les requêtes vers le serveur de production sans erreur CORS.

### Installation
```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd HorebPay-Dashboard

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
npm run dev
```
L'application s'ouvrira sur `http://localhost:5173`.

### Comment ça marche en local ?
Le fichier `vite.config.ts` contient une règle qui dit :
> *"Si le frontend demande `/api`, redirige la demande vers `https://prod.horebpay.com/horeb/api` en arrière-plan."*

C'est pourquoi vous pouvez voir les données de production même en travaillant en local.

---

## 3. Déploiement & Mise à Jour (Production)

Le site est hébergé sur **Vercel**. Le déploiement est **automatisé** via GitHub.

###  Le fichier critique : `vercel.json`
Contrairement à un site statique classique, ce projet **nécessite** le fichier `vercel.json` situé à la racine. Ce fichier gère le routage complexe vers le backend Java :
1.  Redirige `/api/auth/login` vers `/horeb/users/login`.
2.  Redirige `/api/*` vers `/horeb/api/*`.

**Ne supprimez jamais ce fichier.**

### Comment mettre à jour le site ?
Vous n'avez pas besoin d'aller sur le site de Vercel.

1.  Effectuez vos modifications dans le code (VS Code).
2.  Ouvrez le terminal et lancez ces 3 commandes :

```bash
git add .
git commit -m "Description de la mise à jour (ex: Ajout filtre statut paiement)"
git push
```

**C'est tout.** Vercel détectera le changement sur GitHub, reconstruira le projet, et le site sera à jour en moins de 2 minutes.

---

## 4. Guide de Modification Rapide

Voici où aller pour effectuer les changements les plus courants demandés par la direction :

### Changer les couleurs de la marque
Le projet utilise Tailwind CSS avec des codes hexadécimaux spécifiques.
*   **Bleu Horeb :** Rechercher et remplacer `[#1e3a8a]`
*   **Jaune Or :** Rechercher et remplacer `[#FFC107]`

### Modifier le format des montants (Bonus/Prix)
Allez dans `src/pages/Dashboard.tsx` et cherchez la fonction :
*   `formatCurrency` : Pour les montants principaux (arrondis).
*   `formatBonus` : Pour les bonus (garde 2 à 4 décimales).

### Ajouter une colonne au tableau
1.  Allez dans `src/pages/Dashboard.tsx`.
2.  Modifiez l'interface `Transaction` ou `Client` (au début du fichier).
3.  Dans la fonction `fetchData`, mappez la nouvelle donnée venant de l'API.
4.  Dans le `return` (HTML), ajoutez une balise `<th>` pour l'entête et `<td>` pour la donnée.

---

## 5. Commandes Utiles

| Action | Commande |
|--------|----------|
| Lancer en local | `npm run dev` |
| Construire pour prod | `npm run build` |
| Vérifier les erreurs | `npm run lint` |

---
**Date de creation:** Novembre 2025
**Dernière mise à jour :** Janvier 2026
**Responsable Technique :** Équipe Frontend HorebPay
