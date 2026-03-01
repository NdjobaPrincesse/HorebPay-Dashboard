
# Documentation Technique — HorebPay Dashboard

## Vue d'ensemble

Le **HorebPay Dashboard** est une application web monopage (SPA) construite avec **React 19 + TypeScript**, déployée sur **Vercel** et connectée à une API **Spring Boot (Java)** hébergée à `http://158.220.104.62:8089/horeb/api`.

Elle permet à l'équipe administrative HorebPay de :
- Consulter et filtrer les **transactions financières**
- Gérer les **comptes clients**
- Administrer les **entreprises partenaires** (validation, recharge de portefeuille)
- Effectuer des **dépôts / transferts d'argent**
- Imprimer des **reçus de transaction** professionnels

---

## Pile Technologique

| Couche | Technologie | Version |
|---|---|---|
| Framework UI | React | 19.2.0 |
| Langage | TypeScript | ~5.9.3 |
| Outil de build | Vite | 7.2.4 |
| Styles | Tailwind CSS | 4.1.17 |
| Routage | React Router DOM | 7.10.1 |
| Client HTTP | Axios | 1.13.2 |
| Icônes | Lucide React | 0.556.0 |
| Déploiement | Vercel | — |

---

## Structure du Projet

```
HorebPay-Dashboard/
├── index.html                        # Point d'entrée HTML
├── vite.config.ts                    # Config Vite (proxy API en développement)
├── vercel.json                       # Règles de réécriture pour Vercel (production)
├── tsconfig.json                     # Configuration TypeScript
├── tailwind.config.js                # Configuration Tailwind CSS
├── package.json                      # Dépendances et scripts npm
│
└── src/
    ├── main.tsx                      # Point d'entrée React
    ├── App.tsx                       # Composant racine + définition des routes
    ├── index.css                     # Styles globaux et règles d'impression
    ├── config.ts                     # Constantes globales de l'application
    │
    ├── api/                          # Couche de communication avec le backend
    │   ├── axios.ts                  # Instance Axios avec intercepteurs
    │   ├── auth.ts                   # Authentification (login / logout)
    │   ├── services.ts               # Toutes les fonctions d'appels API
    │   └── client.ts                 # Appels API spécifiques aux clients
    │
    ├── types/
    │   └── index.ts                  # Interfaces TypeScript (Transaction, Client, Enterprise)
    │
    ├── utils/
    │   └── formatters.ts             # Fonctions de formatage (montants, statuts, texte)
    │
    ├── pages/                        # Pages principales
    │   ├── Dashboard.tsx             # Page principale — tableau de bord à 3 onglets
    │   ├── LoginPage.tsx             # Page de connexion
    │   ├── ClientsPage.tsx           # Page dédiée aux clients (secondaire)
    │   └── TransactionsPage.tsx      # Page dédiée aux transactions (secondaire)
    │
    └── components/                   # Composants réutilisables
        ├── Layout.tsx                # Mise en page commune
        ├── ConfirmationModal.tsx     # Boîte de dialogue de confirmation générique
        ├── DepositModal.tsx          # Formulaire de dépôt / transfert d'argent
        ├── EnterpriseRechargeModal.tsx # Recharge du portefeuille entreprise
        ├── LogoutModal.tsx           # Confirmation de déconnexion
        ├── TransactionReceipt.tsx    # Reçu de transaction (style ticket fintech)
        ├── StatCard.tsx              # Carte statistique simple
        ├── ClientPrintModal.tsx      # Impression de fiche client
        │
        ├── layout/
        │   └── Sidebar.tsx           # Barre latérale de navigation
        │
        └── dashboard/
            ├── TransactionDetailsModal.tsx  # Détails complets d'une transaction
            ├── TransactionList.tsx          # Liste de transactions (version compacte)
            ├── ClientTable.tsx              # Tableau clients (version secondaire)
            │
            ├── tables/                      # Tableaux de données principaux
            │   ├── TransactionsTable.tsx    # Tableau des transactions
            │   ├── ClientsTable.tsx         # Tableau des clients
            │   └── EnterprisesTable.tsx     # Tableau des entreprises
            │
            └── ui/                          # Petits composants UI atomiques
                ├── KPICard.tsx              # Carte KPI (revenus, volume, utilisateurs)
                ├── StatusBadge.tsx          # Badge de statut coloré
                ├── TabButton.tsx            # Bouton d'onglet de navigation
                └── ActionIconBtn.tsx        # Bouton d'action avec icône
```

---

## Description Détaillée des Fichiers

### Configuration

#### `src/config.ts`
Contient les constantes globales utilisées partout dans l'application.

```typescript
API_BASE_URL: '/api'                                          // URL de base (proxy)
API_TIMEOUT: 15000                                            // Délai d'attente (15s)
CLIENT_INITIATOR: "WEB_DASHBOARD_ADMIN"                       // Identifiant de l'initiateur
DEPOSIT_CLIENT_ID: "72ed67aa-1077-42ee-8f53-d1f66def5470"   // ID client pour les dépôts
```

#### `vite.config.ts`
Configure Vite pour le développement local. Le **proxy** redirige les appels `/api/*` vers le serveur Spring Boot en arrière-plan, évitant ainsi les erreurs CORS.

```
/api/auth/login  →  http://158.220.104.62:8089/horeb/api/users/login
/api/*           →  http://158.220.104.62:8089/horeb/api/*
```

#### `vercel.json`
Applique les mêmes règles de réécriture en **production** sur Vercel. Aussi, il configure la SPA pour que React Router gère toutes les routes (toutes les URLs reviennent vers `index.html`).

**Ne jamais supprimer ce fichier — le site production ne fonctionnerait plus.**

---

### Couche API (`src/api/`)

#### `src/api/axios.ts`
Crée l'instance Axios partagée dans toute l'application.

- `baseURL` : `/api` (redirigé par le proxy vers le backend)
- `withCredentials: true` : envoie les cookies HTTP-only (session)
- **Intercepteur de requête** : ajoute automatiquement `Authorization: Bearer {token}` si un token est présent dans le `localStorage`
- **Intercepteur de réponse** : intercepte les erreurs 401 (non autorisé)

#### `src/api/auth.ts`
Gère toute la logique d'authentification.

| Fonction | Description |
|---|---|
| `login(userName, password)` | Appel POST vers `/auth/login`, stocke `userId` et `clientInitiator` dans `localStorage` |
| `logout()` | Vide le `localStorage` et redirige vers `/login` |
| `isAuthenticated()` | Vérifie la présence de `userId` dans `localStorage` (protection des routes) |

#### `src/api/services.ts`
Point central de tous les appels API. Expose l'objet `ApiService` organisé par domaine :

| Domaine | Méthode | Endpoint |
|---|---|---|
| `auth` | `login()` | POST `/auth/login` |
| `dashboard` | `getTransactions()` | GET `/transactions` |
| `dashboard` | `getClients()` | GET `/clients` |
| `enterprise` | `getAll()` | GET `/entreprise` |
| `enterprise` | `recharge()` | POST `/transactions/wallet/entreprise/recharge` |
| `enterprise` | `update()` | PUT `/entreprise/{id}` |
| `enterprise` | `delete()` | DELETE `/entreprise/{id}` |
| `transactions` | `getConfig()` | GET `/money-transfer-config` |
| `transactions` | `deposit()` | POST `/transactions/deposit` |

---

### Types TypeScript (`src/types/index.ts`)

Définit les interfaces des objets de données principaux.

**`Transaction`** — Représente une transaction financière :
- `id`, `txRef`, `date`, `clientName`, `clientId`
- `operator`, `product`, `paymentMethod`
- `payerPhone`, `receiverPhone`
- `amount`, `bonus`
- `paymentStatus`, `txStatus`, `errorMessage`

**`Client`** — Représente un utilisateur de la plateforme :
- `clientId`, `nom`, `prenom`, `telephone`, `email`, `date`
- `solde`, `soldeBonus`, `firstLogin`

**`Enterprise`** — Représente une entreprise partenaire :
- `entrepriseId`, `nom`, `rccm`, `niu`, `email`, `telephone`
- `lieu`, `rue`, `boitePostale`, `status`, `dateCreationEntreprise`
- `responsableNom`, `responsablePrenom`, `responsableTelephone`, `responsableEmail`
- `isValidated`

---

### Utilitaires (`src/utils/formatters.ts`)

Fonctions pures de formatage utilisées dans les tableaux et modales.

| Fonction | Entrée | Sortie exemple |
|---|---|---|
| `formatCurrency(val)` | `1234` | `"1 234 F CFA"` |
| `formatBonus(val)` | `0.125` | `"0,125 F CFA"` |
| `normalizeStatus(status)` | `"SUCCESSFUL"` | `"SUCCESS"` |
| `cleanStr(str)` | `"Élodie"` | `"elodie"` (pour recherche) |

---

### Pages (`src/pages/`)

#### `src/pages/Dashboard.tsx`
Le composant le plus important de l'application. Il orchestre tout le tableau de bord.

**État géré :**
- Données : `transactions`, `clients`, `enterprises`
- UI : `activeTab`, `loading`, `isPrivacyMode`, `showFilters`
- Modales : `isLogoutOpen`, `isRechargeOpen`, `isDepositOpen`, `isDenyModalOpen`, `selectedTx`

**Chargement des données :**
```typescript
// Au montage du composant, les 3 sources de données sont chargées en parallèle
useEffect(() => {
  Promise.allSettled([getTransactions(), getClients(), getEnterprises()]);
}, []);
```

**Filtrage :**
- Entièrement côté client (navigateur), sans appels API supplémentaires
- Utilise `useMemo` pour de bonnes performances
- Filtres disponibles : plage de dates, statut, montant, numéro de téléphone, texte libre

**Onglets disponibles :**
1. **Transactions** — Tableau avec 9 colonnes (date, client, service, méthode, flux, montant, bonus, statut, actions)
2. **Clients** — Tableau avec solde, bonus, statut
3. **Entreprises** — Tableau avec actions (valider, rejeter, recharger)

#### `src/pages/LoginPage.tsx`
Page de connexion avec formulaire (identifiant + mot de passe). Redirige vers `/` si déjà authentifié.

---

### Composants (`src/components/`)

#### `src/components/dashboard/tables/TransactionsTable.tsx`
Affiche le tableau principal des transactions. Fonctionnalités :
- Double badge de statut (Paiement + Transaction)
- Mode confidentialité (masque les données sensibles)
- Bouton pour ouvrir le reçu

#### `src/components/dashboard/tables/ClientsTable.tsx`
Affiche la liste des clients avec solde et bonus formatés. Supporte le mode confidentialité.

#### `src/components/dashboard/tables/EnterprisesTable.tsx`
Affiche les entreprises. Pour chaque ligne, selon le statut :
- **En attente** : boutons Approuver / Rejeter
- **Approuvée** : bouton Recharger

#### `src/components/dashboard/ui/KPICard.tsx`
Carte affichant un indicateur clé (revenu total, volume de transactions, nombre d'utilisateurs actifs).

#### `src/components/dashboard/ui/StatusBadge.tsx`
Badge coloré selon le statut : `SUCCESS` (vert), `FAILED` (rouge), `PENDING` (jaune).

#### `src/components/EnterpriseRechargeModal.tsx`
Formulaire de recharge du portefeuille d'une entreprise. Champs : montant + code secret (`masterSecret`). Appelle `ApiService.enterprise.recharge()`.

#### `src/components/DepositModal.tsx`
Formulaire de dépôt / transfert. Affiche les frais calculés en temps réel. Appelle `ApiService.transactions.deposit()`.

#### `src/components/ConfirmationModal.tsx`
Boîte de dialogue générique réutilisable pour confirmer une action (ex : rejet d'une entreprise).

#### `src/components/TransactionReceipt.tsx`
Reçu de transaction au design "ticket fintech". Imprimable via `window.print()` avec les styles définis dans `index.css`.

#### `src/components/LogoutModal.tsx`
Confirmation de déconnexion. Appelle `logout()` de `auth.ts`.

---

### Styles (`src/index.css`)

Contient :
- Les directives Tailwind CSS (`@tailwind base/components/utilities`)
- Les **règles d'impression** (`@media print`) :
  - Cache tous les éléments de l'interface sauf `.print-area`
  - Préserve les couleurs avec `print-color-adjust: exact`

---

## Routage

Défini dans `src/App.tsx` avec React Router DOM.

| Route | Composant | Accès |
|---|---|---|
| `/login` | `LoginPage` | Public (redirige vers `/` si connecté) |
| `/` | `Dashboard` | Protégé (redirige vers `/login` si non connecté) |
| `*` | — | Redirige vers `/` |

La protection de route est gérée par `PrivateRoutes`, un wrapper qui vérifie `isAuthenticated()` avant de rendre le contenu.

---

## Gestion de Session

La session repose sur deux mécanismes complémentaires :

1. **`localStorage`** — stocke `userId`, `clientInitiator`, et les infos `user` (JSON)
2. **Cookies HTTP-only** — gérés par le backend Spring Boot (`withCredentials: true` côté Axios)

La vérification d'authentification consiste à tester la présence de `userId` dans le `localStorage`.

---

## Flux de Données — Exemple : Recharge Entreprise

```
Utilisateur clique "Recharger" (EnterprisesTable)
    ↓
Dashboard : isRechargeOpen = true, entrepriseId sauvegardé
    ↓
EnterpriseRechargeModal s'affiche avec les données pré-remplies
    ↓
Utilisateur saisit montant + masterSecret → clique "Valider"
    ↓
ApiService.enterprise.recharge() → POST /transactions/wallet/entreprise/recharge
    Payload : { clientInitiatorId, entrepriseId, masterSecret, montant }
    ↓
Réponse backend → succès ou message d'erreur affiché dans la modale
    ↓
Utilisateur ferme la modale → peut rafraîchir manuellement les données
```

---

## Flux d'Authentification

```
Utilisateur visite l'application
    ↓
App.tsx → PrivateRoutes vérifie isAuthenticated()
    ↓
Non authentifié → Redirection vers /login
    ↓
Saisie identifiant + mot de passe → bouton "Connexion"
    ↓
auth.login() → POST /api/auth/login
    Payload : { userName, password, clientInitiator }
    ↓
Backend renvoie userId + token
    ↓
localStorage.setItem('userId', ...) + localStorage.setItem('user', ...)
    ↓
Redirection vers / → Dashboard se charge
    ↓
useEffect → Promise.allSettled([getTransactions, getClients, getEnterprises])
    ↓
Données affichées dans les tableaux
```

---

## Couleurs de Marque

| Nom | Code Hex | Usage |
|---|---|---|
| Bleu Horeb | `#1e3a8a` | En-tête, boutons principaux, accents |
| Or / Jaune | `#FFC107` | Éléments secondaires, badges |

Pour modifier une couleur, effectuez un remplacement global (Ctrl+H dans VS Code) dans le dossier `src/`.

---

## Commandes de Développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement (http://localhost:5173)
npm run dev

# Compiler pour la production
npm run build

# Prévisualiser le build de production
npm run preview

# Analyser les erreurs TypeScript / ESLint
npm run lint
```

---

## Déploiement

Le déploiement est **entièrement automatisé** via l'intégration GitHub ↔ Vercel.

Pour mettre à jour le site en production :

```bash
git add .
git commit -m "Description de la modification"
git push
```

Vercel détecte le push, lance `npm run build`, et déploie automatiquement le nouveau build.

---

## Guide de Modification Rapide

| Objectif | Fichier(s) à modifier |
|---|---|
| Changer les couleurs de marque | Rechercher/remplacer `[#1e3a8a]` ou `[#FFC107]` dans `src/` |
| Modifier le format des montants | `src/utils/formatters.ts` → `formatCurrency()` / `formatBonus()` |
| Ajouter une colonne au tableau | `src/types/index.ts` (interface) + `src/components/dashboard/tables/` (affichage) |
| Ajouter un appel API | `src/api/services.ts` (définir la fonction) + composant concerné (appeler la fonction) |
| Modifier les constantes globales | `src/config.ts` |
| Changer l'URL du backend | `vite.config.ts` (dev) et `vercel.json` (prod) |
| Modifier les styles d'impression | `src/index.css` → section `@media print` |
| Ajouter une nouvelle route | `src/App.tsx` + créer la page dans `src/pages/` |

---

**Date de création :** Novembre 2025
**Dernière mise à jour :** Mars 2026
**Responsable Technique :** Équipe Frontend HorebPay
