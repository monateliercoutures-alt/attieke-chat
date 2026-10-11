# Attiéké Abidjan (`attieke-chat`) — Client Frontend

Application web **mobile-first** de vente d'attiéké ivoirien authentique par chat en direct, pensée pour la **diaspora africaine et les amateurs de gastronomie ouest-africaine en Chine** (Pékin, Shanghai, Canton, Shenzhen, Yiwu, Wuhan…).

Ce dépôt contient l'intégralité du **frontend client autonome** (`apps/web`) ainsi que les **types et schémas Zod partagés** (`packages/shared`), fonctionnant avec une couche de services mockée réaliste et persistée dans `localStorage`, prête à être branchée sur une API réelle sans modifier un seul composant React.

---

## 1. Stack technique & Architecture

- **Framework** : Next.js 14 (App Router) avec rendu statique/hybride par langue (`/[locale]`).
- **Langage** : TypeScript strict (`strict: true`, **zéro `any`** dans tout le projet).
- **Styles & Design** : Tailwind CSS, variables CSS de thème (`#0F4C3A` vert profond, `#F4B41A` jaune doré, `#FAF6EE` blanc cassé, `#D9FDD3` vert menthe), direction artistique inspirée de **WhatsApp.com** avec nos couleurs et icônes open-source.
- **State management** : Zustand (`useAppStore` + store normalisé `useChatStore` indexant conversations, messages et statuts de livraison par ID).
- **Validation & Sécurité** : Zod (`packages/shared`), échappement anti-XSS sur tous les messages/liens cliquables, et limite de taille de fichiers (10 Mo).
- **Internationalisation (`i18n`)** : 3 langues complètes (`zh` Chinois simplifié par défaut pour la Chine, `fr` Français, `en` Anglais) dans `apps/web/src/locales/{zh,fr,en}/*.json` — **zéro chaîne de texte en dur** dans les composants.
- **Compatibilité Chine continentale (Great Firewall)** : **zéro service Google** (aucune Google Font, aucun Google Analytics, aucun reCAPTCHA, aucun CDN Google). Polices et emojis système natifs optimisés (`PingFang SC`, `Microsoft YaHei`, `Noto Sans SC`, `-apple-system`, `sans-serif`) et images 100 % locales dans `apps/web/public/images/`.

### Structure du monorepo

```text
attieke-chat/
├── package.json                          # Scripts racine (dev, build, start, typecheck, test)
├── packages/
│   └── shared/                           # @attieke-chat/shared : Schémas Zod, types TS & règles de transition
│       └── src/index.ts                  # User, Address, Product, Order, Conversation, Message, Presence, DeliveryStatus
└── apps/
    └── web/                              # @attieke-chat/web : Application Next.js cliente
        ├── public/images/                # Photos produits, bol hero et avatars locaux
        ├── scripts/run-tests.cjs         # Exécuteur de tests unitaires TypeScript
        └── src/
            ├── app/[locale]/             # Routes i18n (/, /chat, /catalog, /orders, /profile, /auth)
            ├── components/chat/          # Module Chat WhatsApp complet (Sous-phases A à F) :
            │   ├── ConversationList.tsx  # Liste des 3 conversations, filtres Toutes/Non lues, épingler, sourdine, brouillons
            │   ├── ChatHeader.tsx        # Avatar, présence temps réel, appels vocal/vidéo, recherche, thème, mode hors-ligne
            │   ├── SearchBar.tsx         # Recherche dans la conversation avec compteur et navigation ↑/↓
            │   ├── MessageList.tsx       # Fil paginé vers le haut, séparateurs de date, non-lus, bouton flottant ↓
            │   ├── MessageBubble.tsx     # Bulles client/vendeur avec queue SVG, 5 états de livraison, lecteur vocal 1x/1.5x/2x
            │   ├── Composer.tsx          # Zone de saisie, brouillons, citation, raccourcis commerce rapides
            │   ├── VoiceRecorder.tsx     # Enregistreur vocal MediaRecorder + repli onde sonore, verrouillage & annulation
            │   ├── AttachmentSheet.tsx   # Galerie multi-photos, caméra, PDF, position GPS, fiche contact
            │   ├── EmojiPicker.tsx       # Sélecteur d'emojis système par onglets + récents + stickers ivoiriens
            │   ├── ReactionBar.tsx       # Barre des 6 réactions rapides (❤️ 👍 🔥 🙏 😋 🎉)
            │   ├── ContextMenu.tsx       # Menu d'actions message + modale Transférer + modale Infos (Remis ✓✓ / Lu ✓✓ bleu)
            │   ├── ImageViewer.tsx       # Visionneuse plein écran avec zoom (100% à 300%) et navigation multi-images
            │   ├── CallScreen.tsx        # Écran d'appel vocal et vidéo simulé (sonnerie, décrocher, muet, haut-parleur, caméra)
            │   ├── ChatSettingsModal.tsx # Thème clair/sombre, 5 fonds de discussion, taille de police, sons & notifications
            │   ├── ChatProductCard.tsx   # Carte produit intégrée au fil avec ajout direct à la commande
            │   └── ChatOrderCard.tsx     # Carte commande intégrée avec confirmation et suivi 7 étapes
            ├── data/mock/                # Seed réaliste : 3 conversations, 60 messages sur 5 jours, 8 produits, 5 commandes
            ├── hooks/                    # useChat, usePresence, useMessageActions, useVoiceRecorder, useCatalog, useOrders, useAuth
            ├── services/                 # Interfaces AuthService, ChatService, CallService, CatalogService, OrderService + mocks
            └── store/                    # useChatStore (normalisé) + useAppStore + tests unitaires (__tests__)
```

---

## 2. Couche de services & Simulation temps réel

Les écrans et hooks React n'accèdent **jamais** aux données mockées directement : ils appellent exclusivement les interfaces exposées par `apps/web/src/services/index.ts` :

- `ChatService` (`chatService`) :
  - Gestion de **3 conversations** (*Attiéké Abidjan — Awa*, *SF Express & Douane Canton — Chen Wei*, *Chef Kouadio — Conseils & Recettes*) et **60 messages initiaux variés** étalés sur 5 jours.
  - Machine à états de livraison stricte : horloge (`sending`) → `✓` (`sent`) → `✓✓` (`delivered`) → `✓✓` bleu (`read`), ainsi que l'état `failed` (`!`) avec bouton **« Renvoyer »**.
  - Indicateurs de présence temps réel : *« en ligne »*, *« dernière connexion à… »*, *« est en train d'écrire… »*, *« enregistre un message vocal… »*.
  - Mode hors-ligne avec file d'attente et renvoi automatique au rétablissement du réseau.
- `CallService` (`callService`) :
  - Appels vocaux et vidéo simulés de bout en bout (sonnerie, décrocher, raccrocher, muet, haut-parleur, caméra) isolés derrière une interface prête pour WebRTC.
- `CatalogService` (`catalogService`), `OrderService` (`orderService`) et `AuthService` (`authService`).

---

## 3. Lancement rapide & Tests unitaires

```bash
# 1. Installer les dépendances à la racine du monorepo
npm install

# 2. Exécuter la suite de tests unitaires (règles d'états de livraison, seed 60 messages, store Zustand normalisé)
npm test

# 3. Vérifier le typage TypeScript strict (zéro erreur, zéro any)
npm run typecheck

# 4. Construire et lancer en mode production (http://0.0.0.0:3000)
npm run build
npm run start
```
