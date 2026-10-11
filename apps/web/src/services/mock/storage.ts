import type {
  ChatPreferences,
  Conversation,
  Message,
  Order,
  Presence,
  Product,
  User,
} from '@attieke-chat/shared';
import {
  INITIAL_CHAT_PREFERENCES,
  INITIAL_CONVERSATION,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_ORDERS,
  INITIAL_PRESENCE_MAP,
  INITIAL_PRODUCTS,
  INITIAL_USER,
} from '@/data/mock/seed';

export interface MockDatabaseState {
  version: number;
  currentUser: User | null;
  products: Product[];
  orders: Order[];
  conversations: Conversation[];
  conversation: Conversation;
  messages: Message[];
  presenceByConversation: Record<string, Presence>;
  preferences: ChatPreferences;
}

const STORAGE_KEY = 'attieke_chat_mock_db_v2';
const DB_VERSION = 2;

let memoryState: MockDatabaseState | null = null;

function createDefaultState(): MockDatabaseState {
  const conversations = structuredClone([...INITIAL_CONVERSATIONS]);
  return {
    version: DB_VERSION,
    currentUser: structuredClone(INITIAL_USER),
    products: structuredClone([...INITIAL_PRODUCTS]),
    orders: structuredClone([...INITIAL_ORDERS]),
    conversations,
    conversation: conversations[0] ?? structuredClone(INITIAL_CONVERSATION),
    messages: structuredClone([...INITIAL_MESSAGES]),
    presenceByConversation: structuredClone(INITIAL_PRESENCE_MAP),
    preferences: structuredClone(INITIAL_CHAT_PREFERENCES),
  };
}

export function loadMockState(): MockDatabaseState {
  if (typeof window === 'undefined') {
    if (!memoryState) {
      memoryState = createDefaultState();
    }
    return memoryState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDatabaseState;
      if (
        parsed &&
        parsed.version === DB_VERSION &&
        Array.isArray(parsed.conversations) &&
        parsed.conversations.length > 0
      ) {
        memoryState = parsed;
        return parsed;
      }
    }
  } catch {
    // Fallback to default seed on storage parse error
  }

  const fresh = createDefaultState();
  memoryState = fresh;
  saveMockState(fresh);
  return fresh;
}

export function saveMockState(state: MockDatabaseState): void {
  if (state.conversations.length > 0) {
    state.conversation = state.conversations[0];
  }
  memoryState = state;
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors in restricted webviews
  }
}

export function resetMockState(): MockDatabaseState {
  const fresh = createDefaultState();
  saveMockState(fresh);
  return fresh;
}
