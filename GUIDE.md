# Guide — TekBoutik

## Démarrer le site

La base de données doit tourner avant le site :

```bash
# 1. Démarrer la base de données (une fois par session de travail)
powershell -ExecutionPolicy Bypass -File demarrer-base-de-donnees.ps1

# 2. Démarrer le site
npm run dev -- --port 3001
```

Puis ouvrez http://localhost:3001

## Compte administrateur

Créé automatiquement lors de l'initialisation (`npx tsx prisma/seed.ts`) :

- Email : `admin@tekboutik.local`
- Mot de passe : `uqprOnbkk2wj`

Changez ce mot de passe dès que possible une fois la gestion de profil disponible.

## Ce qui existe déjà

**Phase 1**
- Inscription / connexion / déconnexion (acheteurs)
- 3 rôles : Acheteur (BUYER), Vendeur (SELLER), Administrateur (ADMIN)
- Pages protégées par rôle : `/compte`, `/vendeur`, `/admin`
- Base de données complète (utilisateurs, vendeurs, produits, commandes, paiements, avis)
- Identité visuelle TekBoutik appliquée (couleurs, polices)

**Phase 2**
- Candidature vendeur : `/devenir-vendeur` (un acheteur connecté peut postuler)
- Approbation admin : `/admin/vendeurs` (approuver / suspendre chaque boutique)
- Tableau de bord vendeur avec écran d'attente tant que non approuvé
- Gestion des produits vendeur (`/vendeur/produits`) : création, modification,
  suppression, upload de photos (stockées dans `public/uploads/produits`),
  caractéristiques techniques personnalisées

**Phase 3**
- Page d'accueil avec vrais produits (vedette, promotions, catégories)
- Catalogue (`/catalogue`) avec filtres combinables : catégorie, prix, note
  minimale, vendeur, disponibilité, tri
- Recherche plein texte PostgreSQL (barre de recherche dans le header, avec
  suggestions en direct) — combinable avec les filtres du catalogue
- Fiche produit (`/produits/[slug]`) : galerie, specs, infos vendeur, avis
  clients, produits similaires
- Données de démonstration : `npx tsx prisma/seed-demo-products.ts` (8 produits
  avec avis, répartis entre les deux vendeurs de test)

**Phase 4**
- Panier multi-vendeurs (`/panier`, stocké dans le navigateur) : regroupe
  automatiquement les articles par vendeur avec sous-totaux
- Gestion des adresses de livraison (`/compte/adresses`)
- Tunnel de commande (`/commande`) : adresse (existante ou nouvelle) →
  récapitulatif par vendeur → création de la commande, avec vérification et
  décrément du stock en base (transaction atomique, protégé contre la survente)
- Historique des commandes (`/compte/commandes`) et détail de commande

**Phase 5**
- Paiement MonCash/NatCash en mode confirmation manuelle : l'acheteur envoie
  l'argent au numéro de la plateforme (configuré dans `/admin/parametres`),
  colle sa référence de transaction sur la page de commande, un administrateur
  vérifie et confirme dans `/admin/paiements` (ou rejette pour redemander)
- Une fois confirmée, la commande passe automatiquement au statut "Payée"
- Le code est prêt pour la vraie API MonCash plus tard : voir
  `src/lib/payments/moncash-api-provider.ts` (TODO commentés, rien à changer
  ailleurs pour l'activer)
- Gestion des commandes reçues côté vendeur (`/vendeur/commandes`) : marquer
  en préparation → expédiée → livrée, uniquement une fois la commande payée

**Phase 6**
- Un acheteur peut laisser (ou modifier) un avis avec note et commentaire,
  uniquement sur un produit qu'il a réellement acheté et payé — la note
  moyenne du produit se recalcule automatiquement
- Le vendeur peut répondre aux avis sur ses produits (`/vendeur/avis`)
- L'administrateur peut modérer (supprimer) n'importe quel avis de la
  plateforme (`/admin/avis`)

**Phase 7**
- Gestion des catégories (`/admin/categories`) : créer, renommer, réorganiser
  (catégorie parente), supprimer (bloqué si des produits l'utilisent encore)
- Modération des produits (`/admin/produits`) : suspendre/réactiver n'importe
  quel produit de la plateforme (invisible du catalogue et de sa fiche une
  fois suspendu)
- Vue de toutes les commandes (`/admin/commandes`), y compris celles sans
  paiement encore soumis
- Tableau de bord (`/admin`) avec les vrais chiffres : commandes payées,
  chiffre d'affaires, revenus de commission, meilleures ventes

**Phase 8 — Finitions**
- Navigation mobile (menu, recherche) — auparavant invisible sur téléphone
- `sitemap.xml` et `robots.txt` générés automatiquement
- Contrastes de couleurs corrigés (WCAG AA) et labels d'accessibilité ajoutés
- Photos de produits optimisées (`next/image`, chargement différé)
- Tests automatisés sur les flux critiques : `npm test`
- Build de production vérifié (`npm run build`) — un vrai bug de config
  (Auth.js `trustHost`) a été trouvé et corrigé à cette étape

Le cahier des charges est maintenant entièrement implémenté (Phases 1 à 8).

## Déploiement en ligne

Le site tourne pour l'instant seulement sur cet ordinateur. Pour le rendre
accessible sur internet :

### 1. Créer les comptes nécessaires (à faire vous-même)

Je ne peux pas créer de comptes en votre nom. Il vous faut :

- Un compte **GitHub** (gratuit) — pour héberger le code
- Un compte **[Neon](https://neon.tech)** (gratuit) — base de données PostgreSQL en ligne
- Un compte **[Vercel](https://vercel.com)** (gratuit) — héberge le site

### 2. Base de données en ligne

Sur Neon, créez un projet, copiez la chaîne de connexion (`DATABASE_URL`).
Puis, depuis votre ordinateur, appliquez le schéma à cette nouvelle base :

```bash
# Remplacez temporairement DATABASE_URL dans .env par celle de Neon, puis :
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

### 3. Déployer sur Vercel

1. Poussez le dossier `tekboutik` sur un dépôt GitHub (dites-le-moi, je peux
   préparer le commit).
2. Sur Vercel, "Import Project" depuis ce dépôt.
3. Dans les réglages du projet Vercel, ajoutez les variables d'environnement
   (voir `.env.example`) :
   - `DATABASE_URL` (celle de Neon)
   - `AUTH_SECRET` (générez-en une **nouvelle** avec `openssl rand -base64 32`
     — ne réutilisez pas celle du fichier `.env` local)
   - `NEXT_PUBLIC_SITE_URL` (l'adresse Vercel, ex: `https://tekboutik.vercel.app`)
4. Déployez.

### ⚠️ Important : les photos de produits

Les photos uploadées par les vendeurs sont actuellement enregistrées dans
`public/uploads/` **sur le disque du serveur**. Sur Vercel (et la plupart des
hébergeurs "serverless"), ce dossier est effacé à chaque déploiement — les
photos seraient perdues.

Avant de mettre le site en ligne pour de vrai, il faut brancher un stockage
externe (ex: Cloudflare R2, gratuit jusqu'à 10 Go). Le code est déjà prêt pour
ça : il suffit d'écrire une nouvelle classe dans `src/lib/storage/` qui
implémente la même interface que `local.ts`, puis de la brancher dans
`src/lib/storage/index.ts`. Dites-le-moi quand vous serez prêt, je le ferai
avec vous.

### 4. Après le déploiement

- Connectez-vous avec le compte admin (voir section précédente)
- Configurez vos vrais numéros MonCash/NatCash dans `/admin/parametres`
- Si vous activez la vraie API MonCash plus tard, réglez la "Return URL"
  dans votre tableau de bord marchand MonCash sur
  `https://votre-domaine.com/api/moncash/callback` (à créer — voir
  `moncash-api-provider.ts`)

## Base de données

PostgreSQL tourne localement sur le port 5433 (pas le port standard 5432, pour éviter
tout conflit). Les données sont stockées dans `C:\Users\billy bob\pgdata-tekboutik`,
en dehors du dossier du projet.

Pour explorer les données visuellement :

```bash
npx prisma studio
```

## Si le site plante juste après une modification du schéma

Si vous (ou moi) modifions `prisma/schema.prisma` pendant que le site tourne,
il arrive que le serveur garde en cache une ancienne version compilée et
affiche une erreur du type "Unknown argument". Solution : arrêter le serveur,
supprimer le dossier `.next`, puis relancer `npm run dev`.
