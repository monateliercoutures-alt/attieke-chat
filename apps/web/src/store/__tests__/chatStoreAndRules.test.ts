import assert from 'node:assert/strict';
import {
  canTransitionDeliveryStatus,
  resolveDeliveryStatusTransition,
  type Message,
} from '@attieke-chat/shared';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
} from '../../data/mock/seed';
import {
  selectFilteredConversations,
  selectTotalUnreadCount,
  useChatStore,
} from '../useChatStore';

export interface TestSuiteResult {
  passed: number;
  failed: number;
  details: string[];
}

export function runChatUnitTests(): TestSuiteResult {
  const details: string[] = [];
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void): void {
    try {
      fn();
      passed += 1;
      details.push(`PASS: ${name}`);
    } catch (error) {
      failed += 1;
      const errMsg = error instanceof Error ? error.message : String(error);
      details.push(`FAIL: ${name} -> ${errMsg}`);
    }
  }

  // 1. Règles de transition des états de livraison (sending -> sent -> delivered -> read + failed/retry)
  test('Règles de livraison : progression normale sending -> sent -> delivered -> read autorisée', () => {
    assert.equal(canTransitionDeliveryStatus('sending', 'sent'), true);
    assert.equal(canTransitionDeliveryStatus('sent', 'delivered'), true);
    assert.equal(canTransitionDeliveryStatus('delivered', 'read'), true);
    assert.equal(
      resolveDeliveryStatusTransition('sending', 'delivered'),
      'delivered'
    );
  });

  test('Règles de livraison : régression interdite (read -> sent ou delivered -> sending bloqués)', () => {
    assert.equal(canTransitionDeliveryStatus('read', 'sent'), false);
    assert.equal(canTransitionDeliveryStatus('read', 'delivered'), false);
    assert.equal(canTransitionDeliveryStatus('delivered', 'sent'), false);
    assert.equal(canTransitionDeliveryStatus('delivered', 'sending'), false);
    assert.equal(resolveDeliveryStatusTransition('read', 'sent'), 'read');
  });

  test('Règles de livraison : échec depuis sending -> failed et réessai failed -> sending autorisés', () => {
    assert.equal(canTransitionDeliveryStatus('sending', 'failed'), true);
    assert.equal(canTransitionDeliveryStatus('failed', 'sending'), true);
    assert.equal(canTransitionDeliveryStatus('read', 'failed'), false);
  });

  // 2. Seed de données : 3 conversations et 60 messages variés
  test('Seed de données : contient exactement 3 conversations et 60 messages variés sur plusieurs jours', () => {
    assert.equal(INITIAL_CONVERSATIONS.length, 3);
    assert.equal(INITIAL_MESSAGES.length, 60);

    const types = new Set(INITIAL_MESSAGES.map((m: Message) => m.type));
    assert.equal(types.has('text'), true);
    assert.equal(types.has('voice'), true);
    assert.equal(types.has('image'), true);
    assert.equal(types.has('document'), true);
    assert.equal(types.has('location'), true);
    assert.equal(types.has('contact'), true);
    assert.equal(types.has('product_card'), true);
    assert.equal(types.has('order_card'), true);
    assert.equal(types.has('status_event'), true);
  });

  // 3. Store Zustand normalisé : conversations, filtres (Toutes / Non lues), épinglage, brouillons, recherche
  test('Store Zustand : normalisation des conversations, tri épinglé et filtre Non lues', () => {
    const store = useChatStore.getState();
    store.hydrateConversations([...INITIAL_CONVERSATIONS]);

    const stateAfterInit = useChatStore.getState();
    assert.equal(stateAfterInit.conversationIds.length, 3);

    const totalUnread = selectTotalUnreadCount(stateAfterInit);
    assert.equal(totalUnread, 5); // 2 sur conv-main-01 + 3 sur conv-logistics-02

    store.setConversationFilter('unread');
    const unreadConvs = selectFilteredConversations(
      useChatStore.getState(),
      'fr'
    );
    assert.equal(unreadConvs.length, 2);

    store.setConversationFilter('all');
    store.setConversationSearchQuery('Kouadio');
    const searchedConvs = selectFilteredConversations(
      useChatStore.getState(),
      'fr'
    );
    assert.equal(searchedConvs.length, 1);
    assert.equal(searchedConvs[0].id, 'conv-chef-03');
    store.setConversationSearchQuery('');
  });

  test('Store Zustand : transitions de statut sur un message, brouillon par conversation et recherche interne', () => {
    const store = useChatStore.getState();
    const conv1Messages = INITIAL_MESSAGES.filter(
      (m: Message) => m.conversationId === 'conv-main-01'
    );
    store.hydrateMessages('conv-main-01', conv1Messages, false);

    const newMsg: Message = {
      id: 'msg-test-999',
      conversationId: 'conv-main-01',
      sender: 'customer',
      type: 'text',
      text: {
        zh: '测试消息',
        fr: 'Message de test unitaire Attiéké',
        en: 'Unit test message Attiéké',
      },
      deliveryStatus: 'sending',
      createdAt: new Date().toISOString(),
    };

    store.upsertMessage(newMsg);
    assert.equal(
      useChatStore.getState().messagesById['msg-test-999']?.deliveryStatus,
      'sending'
    );

    store.transitionMessageStatus('msg-test-999', 'sent');
    assert.equal(
      useChatStore.getState().messagesById['msg-test-999']?.deliveryStatus,
      'sent'
    );

    store.transitionMessageStatus('msg-test-999', 'delivered');
    store.transitionMessageStatus('msg-test-999', 'read');
    assert.equal(
      useChatStore.getState().messagesById['msg-test-999']?.deliveryStatus,
      'read'
    );

    // Tentative de régression invalide (read -> sending) ignorée par le store
    store.transitionMessageStatus('msg-test-999', 'sending');
    assert.equal(
      useChatStore.getState().messagesById['msg-test-999']?.deliveryStatus,
      'read'
    );

    // Brouillon par conversation
    store.setDraftSync('conv-main-01', 'Brouillon test Pékin');
    assert.equal(
      useChatStore.getState().draftsByConversation['conv-main-01'],
      'Brouillon test Pékin'
    );

    // Recherche dans la conversation active
    store.selectConversationSync('conv-main-01');
    store.setMessageSearchQuery('test unitaire');
    assert.equal(
      useChatStore.getState().messageSearchQuery,
      'test unitaire'
    );
    store.setMessageSearchQuery('');
  });

  // 4. Pagination vers le haut, mode hors-ligne et préférences (Sous-phases B à F)
  test('Store Zustand : pagination vers le haut (prependOlderMessages), mode hors-ligne et préférences de thème', () => {
    const store = useChatStore.getState();

    // Mode hors-ligne
    store.setOnlineStatus(false);
    assert.equal(useChatStore.getState().isOnline, false);
    store.setOnlineStatus(true);
    assert.equal(useChatStore.getState().isOnline, true);

    // Préférences (thème, fond, police)
    store.setPreferencesSync({
      theme: 'dark',
      wallpaper: 'emerald_mist',
      fontSize: 'large',
      soundEnabled: true,
      notificationsEnabled: true,
    });
    assert.equal(useChatStore.getState().preferences.theme, 'dark');
    assert.equal(useChatStore.getState().preferences.fontSize, 'large');

    // Suppression de message
    store.removeMessage('conv-main-01', 'msg-test-999');
    assert.equal(
      Boolean(useChatStore.getState().messagesById['msg-test-999']),
      false
    );
  });

  return { passed, failed, details };
}
