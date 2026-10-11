/**
 * Fichier central des tokens de design (Couleurs, Typographie, Espacements & Thèmes).
 * Toute modification ici se répercute automatiquement sur toute l'application web.
 */

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'attieke_theme_mode_v1';

/**
 * Pile de polices système native (aucune police externe, compatible Chine & CJK).
 */
export const SYSTEM_FONT_STACK =
  '"Segoe UI", "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';

/**
 * Palette des couleurs par thème (Clair / Sombre) + Accent Commerce exclusif.
 */
export const COLOR_TOKENS = {
  light: {
    /** Barre d'en-tête / actions primaires */
    headerBg: '#008069',
    /** Vert d'accent (boutons, badges non-lus, bouton envoyer, FAB) */
    accentGreen: '#25D366',
    /** Vert foncé (statuts, liens d'en-tête, texte d'accent lisible sur blanc) */
    darkGreen: '#075E54',
    /** Fond général de l'application */
    appBg: '#FFFFFF',
    /** Fond des panneaux et listes */
    panelBg: '#FFFFFF',
    /** Fond de la barre de saisie et barre de recherche */
    composerBg: '#F0F2F5',
    /** Fond de conversation */
    chatBg: '#EFEAE2',
    /** Bulle envoyée (client) */
    bubbleOut: '#D9FDD3',
    /** Bulle reçue (vendeur) */
    bubbleIn: '#FFFFFF',
    /** Texte principal */
    textPrimary: '#111B21',
    /** Texte secondaire (heure, sous-titres, aperçu) */
    textSecondary: '#667781',
    /** Coches "lu" */
    readTick: '#53BDEB',
    /** Séparateurs fins */
    border: '#E9EDEF',
    /** Bulle de message système (date, statut) */
    systemBubbleBg: '#FFEECD',
    /** Texte de bulle système */
    systemBubbleText: '#54656F',
    /** Capsule active de la barre de navigation mobile */
    navPillBg: '#D8FDD2',
  },
  dark: {
    /** Barre d'en-tête / panneaux supérieurs */
    headerBg: '#0B141A',
    /** Vert d'accent vif (badges non-lus, heure non lue, FAB, bouton envoyer) */
    accentGreen: '#25D366',
    /** Vert secondaire */
    darkGreen: '#00A884',
    /** Fond général (noir-bleu profond WhatsApp Android/iOS) */
    appBg: '#0B141A',
    /** Fond des panneaux et listes */
    panelBg: '#0B141A',
    /** Fond de la barre de recherche pilule et barre de saisie */
    composerBg: '#202C33',
    /** Fond de conversation */
    chatBg: '#0B141A',
    /** Bulle envoyée (client) */
    bubbleOut: '#005C4B',
    /** Bulle reçue (vendeur) */
    bubbleIn: '#202C33',
    /** Texte principal */
    textPrimary: '#E9EDEF',
    /** Texte secondaire (heure, sous-titres, aperçu) */
    textSecondary: '#8696A0',
    /** Coches "lu" */
    readTick: '#53BDEB',
    /** Séparateurs fins en mode sombre */
    border: '#1F2C34',
    /** Bulle de message système en mode sombre */
    systemBubbleBg: '#182229',
    /** Texte de bulle système en mode sombre */
    systemBubbleText: '#8696A0',
    /** Capsule active de la barre de navigation mobile (vert sombre WhatsApp) */
    navPillBg: '#103629',
  },
  brand: {
    /**
     * Jaune doré réservé UNIQUEMENT aux boutons de commerce :
     * "Confirmer la commande", "Commander par chat", "Ajouter à la commande".
     */
    commerceGold: '#F2B705',
    commerceGoldHover: '#DDA604',
    commerceGoldText: '#111B21',
  },
} as const;

/**
 * Échelle typographique stricte (tailles, hauteurs de ligne et graisses).
 */
export const TYPOGRAPHY_TOKENS = {
  /** Texte de message : 14,2 px — hauteur de ligne 19 px — graisse 400 */
  message: {
    fontSize: '14.2px',
    lineHeight: '19px',
    fontWeight: '400',
  },
  /** Heure & coches dans la bulle : 11 px */
  meta: {
    fontSize: '11px',
    lineHeight: '15px',
    fontWeight: '400',
  },
  /** Nom du contact (liste & en-tête) : 16 px — graisse 500 */
  contactName: {
    fontSize: '16px',
    lineHeight: '21px',
    fontWeight: '500',
  },
  /** Aperçu du dernier message : 14 px — graisse 400 */
  preview: {
    fontSize: '14px',
    lineHeight: '19px',
    fontWeight: '400',
  },
  /** Titres d'écran : 19 px — graisse 500 */
  screenTitle: {
    fontSize: '19px',
    lineHeight: '24px',
    fontWeight: '500',
  },
  /** Texte courant (autres pages) : 15 px — hauteur de ligne 1.45 */
  body: {
    fontSize: '15px',
    lineHeight: '1.45',
    fontWeight: '400',
  },
} as const;

/**
 * Dimensions et rayons des composants clés.
 */
export const LAYOUT_TOKENS = {
  /** Rayon d'arrondi des bulles de message : 7,5 px */
  bubbleRadius: '7.5px',
  /** Avatar de l'en-tête de chat : 40 px */
  chatHeaderAvatarSize: '40px',
  /** Avatar de la liste des conversations : 49 px */
  conversationListAvatarSize: '49px',
  /** Cible tactile minimale recommandée : 44 px */
  minTouchTarget: '44px',
  /** Durée des transitions d'interface : 150-250 ms */
  transitionDuration: '180ms',
} as const;

/**
 * Détecte le thème initial côté client :
 * - Priorité au choix enregistré dans localStorage ;
 * - Sinon, Thème Clair ('light') sur ordinateur (>= 768 px, façon WhatsApp Web/Desktop)
 *   et Thème Sombre ('dark') sur mobile (< 768 px, façon WhatsApp Android/iOS).
 */
export function resolveInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Ignorer les erreurs d'accès au stockage
  }
  return window.innerWidth >= 768 ? 'light' : 'dark';
}

/**
 * Applique le thème sur la balise racine `<html>` (`data-theme` + classe `.dark`)
 * et persiste le choix dans `localStorage`.
 */
export function applyThemeToDocument(
  mode: ThemeMode,
  persist: boolean = true
): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  if (persist && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignorer les erreurs d'accès au stockage
    }
  }
}
