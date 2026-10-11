# Attiéké Abidjan (`attieke-chat`) — Client Frontend

Application web **mobile-first** de vente d'attiéké ivoirien authentique par chat en direct, pensée pour la **diaspora africaine et les amateurs de gastronomie ouest-africaine en Chine** (Pékin, Shanghai, Canton, Shenzhen, Yiwu, Wuhan…).

Ce dépôt contient l'intégralité du **frontend client autonome** (`apps/web`) ainsi que les **types et schémas Zod partagés** (`packages/shared`), fonctionnant avec une couche de services mockée réaliste et persistée dans `localStorage`, prête à être branchée sur une API réelle sans modifier un seul composant React.

---

## 1. Stack technique & Architecture

- **Framework** : Next.js 14 (App Router) avec rendu statique/hybride par langue (`/[locale]`).
- **Langage** : TypeScript strict (`strict: true`, **zéro `any`** dans tout le projet).
- **Styles & Design** : Tailwind CSS + tokens centralisés dans `apps/web/src/styles/theme.ts` et variables CSS dans `apps/web/src/app/globals.css` (thème clair et thème sombre commutables et persistés, respectant le thème système par défaut).
- **State management** : Zustand (`useAppStore` + store normalisé `useChatStore` indexant conversations, messages et statuts de livraison par ID).
- **Validation & Sécurité** : Zod (`packages/shared`), échappement anti-XSS sur tous les messages/liens cliquables, et limite de taille de fichiers (10 Mo).
- **Internationalisation (`i18n`)** : 3 langues complètes (`zh` Chinois simplifié par défaut pour la Chine, `fr` Français, `en` Anglais) dans `apps/web/src/locales/{zh,fr,en}/*.json` — **zéro chaîne de texte en dur** dans les composants.
- **Compatibilité Chine continentale (Great Firewall)** : **zéro service Google** (aucune Google Font, aucun Google Analytics, aucun reCAPTCHA, aucun CDN Google). Pile de polices système native et images 100 % locales dans `apps/web/public/images/`.

---

## 2. Guide de style & Tokens de design (`apps/web/src/styles/theme.ts`)

Toutes les couleurs, tailles de police et dimensions sont centralisées dans `apps/web/src/styles/theme.ts`, exposées sous forme de variables CSS (`--wa-*`) dans `apps/web/src/app/globals.css`, et mappées dans `apps/web/tailwind.config.ts`. Aucune couleur ni taille n'est écrite en dur dans les composants.

### 2.1 Palette de couleurs (Thème Clair & Thème Sombre)

| Rôle sémantique | Variable CSS | Classe Tailwind | Thème Clair (`light`) | Thème Sombre (`dark`) |
| :--- | :--- | :--- | :--- | :--- |
| **Barre d'en-tête / actions primaires** | `--wa-header-bg` | `bg-wa-header` | `#008069` | `#202C33` |
| **Vert d'accent (badges non-lus, bouton envoyer)** | `--wa-accent-green` | `bg-wa-accent` / `text-wa-accent` | `#25D366` | `#00A884` |
| **Vert foncé (statuts, liens d'en-tête)** | `--wa-dark-green` | `bg-wa-dark-green` / `text-wa-dark-green` | `#075E54` | `#00A884` |
| **Fond général / panneaux** | `--wa-panel-bg` | `bg-wa-panel` | `#FFFFFF` | `#202C33` |
| **Fond de la barre de saisie / recherche** | `--wa-composer-bg` | `bg-wa-composer` | `#F0F2F5` | `#202C33` |
| **Fond de conversation** | `--wa-chat-bg` | `bg-wa-chat-bg` | `#EFEAE2` | `#0B141A` |
| **Bulle envoyée (client)** | `--wa-bubble-out` | `bg-wa-bubble-out` | `#D9FDD3` | `#005C4B` |
| **Bulle reçue (vendeur)** | `--wa-bubble-in` | `bg-wa-bubble-in` | `#FFFFFF` | `#202C33` |
| **Texte principal** | `--wa-text-primary` | `text-wa-text-primary` | `#111B21` | `#E9EDEF` |
| **Texte secondaire (heure, sous-titres)** | `--wa-text-secondary` | `text-wa-text-secondary` | `#667781` | `#8696A0` |
| **Coches « lu » (`✓✓`)** | `--wa-read-tick` | `text-wa-read-tick` | `#53BDEB` | `#53BDEB` |
| **Séparateurs fins** | `--wa-border` | `border-wa-border` | `#E9EDEF` | `#222D34` |
| **Bulle système (date, statut)** | `--wa-system-bg` / `--wa-system-text` | `bg-wa-system-bg text-wa-system-text` | `#FFEECD` / `#54656F` | `#182229` / `#8696A0` |

### 2.2 Accent de marque exclusif pour le commerce (`#F2B705`)

- **Jaune doré `#F2B705`** (`--wa-commerce-gold` / `bg-wa-commerce` avec texte sombre `#111B21` `text-wa-commerce-text`) :
  - **Règle stricte** : réservé **uniquement** aux boutons d'action commerciale (*« Confirmer la commande »*, *« Commander par chat »*, *« Ajouter à la commande »*).
  - **Jamais utilisé ailleurs** (les autres boutons et contrôles utilisent `#008069` ou `#25D366` / `#00A884`).

### 2.3 Typographie & Rendu CJK (Chinois simplifié)

- **Pile de polices système native (zéro police externe)** :
  ```css
  font-family: "Segoe UI", "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
  ```
- **Échelle des tailles** :
  - **Texte de message** (`text-wa-msg` / `.wa-text-message`) : `14,2 px` — interligne `19 px` — graisse `400`.
  - **Heure & coches dans la bulle** (`text-wa-meta` / `.wa-text-meta`) : `11 px` — interligne `15 px`.
  - **Nom du contact (liste & en-tête)** (`text-wa-contact` / `.wa-text-contact`) : `16 px` — graisse `500`.
  - **Aperçu du dernier message** (`text-wa-preview` / `.wa-text-preview`) : `14 px` — graisse `400`, couleur secondaire.
  - **Titres d'écran** (`text-wa-title` / `.wa-text-title`) : `19 px` — graisse `500`.
  - **Texte courant des autres pages** (`text-wa-body` / `.wa-text-body`) : `15 px`–`16 px` — interligne `1.45`.
- **Règles CJK (`:lang(zh)`)** : `line-break: anywhere` et `overflow-wrap: break-word` pour éviter tout débordement de bulle en chinois simplifié.

### 2.4 Règles des bulles, de la liste et de la mise en page

1. **En-tête de chat (`ChatHeader.tsx`)** : avatar rond `40 px`, nom (`16 px`, `500`), statut sous le nom (*« en ligne »* / *« est en train d'écrire… »*), icônes SVG fines à droite (appel vocal, appel vidéo, recherche, menu) avec cibles tactiles `>= 44 px`.
2. **Bulles de message (`MessageBubble.tsx`)** :
   - Coins arrondis **`7,5 px`** (`rounded-wa-bubble`),
   - Petite queue SVG **uniquement sur le premier message d'une série** (`isFirstInSeries`),
   - Ombre très légère (`shadow-wa-bubble`),
   - Largeur maximale **`65 %` sur desktop** (`md:max-w-[65%]`) et **`80 %` sur mobile** (`max-w-[80%]`),
   - Heure (`11 px`) + coches (`✓` / `✓✓` gris / `✓✓` bleu `#53BDEB`) alignées en bas à droite à l'intérieur de la bulle.
3. **Séparateurs de date & événements système (`MessageList.tsx`)** : centrés dans une pastille arrondie `#FFEECD` avec texte `#54656F`.
4. **Barre de saisie (`Composer.tsx`)** : barre `#F0F2F5` (`#202C33` en sombre) contenant un champ blanc arrondi avec icônes emoji et pièce jointe à l'intérieur, et un bouton rond vert `44 px` à droite (icône micro quand le champ est vide, flèche d'envoi dès que du texte est saisi).
5. **Liste des conversations (`ConversationList.tsx`)** : avatar rond `49 px` à gauche, nom en gras (`16 px`, `500`), aperçu du dernier message tronqué sur 1 ligne (`14 px`), heure à droite (`11 px`), badge rond vert (`#25D366`) du nombre de non-lus, séparateur fin `1 px` (`#E9EDEF`) décalé sous le texte (inset de `76 px`).
6. **Fond de conversation** : couleur unie `#EFEAE2` (`#0B141A` en sombre) avec motif géométrique léger généré purement en CSS (`.wa-chat-wallpaper`) — aucune image propriétaire externe.

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
