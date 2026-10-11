import type {
  AuthService,
  CallService,
  CatalogService,
  ChatService,
  OrderService,
} from './types';
import {
  MockAuthService,
  MockCatalogService,
  MockOrderService,
} from './mock/mockServices';
import { MockCallService, MockChatService } from './mock/mockChatService';

/**
 * Point d'entrée unique de la couche de services.
 * Tous les écrans et hooks consomment uniquement ces interfaces.
 * Pour brancher l'API réelle plus tard : remplacer les instances Mock* ci-dessous
 * par des implémentations Http* (fetch/axios) sans toucher aux composants React.
 */
export const authService: AuthService = new MockAuthService();
export const catalogService: CatalogService = new MockCatalogService();
export const orderService: OrderService = new MockOrderService();
export const chatService: ChatService = new MockChatService(orderService);
export const callService: CallService = new MockCallService();

export type {
  AuthService,
  CallService,
  CallSession,
  CallStatus,
  CallType,
  CatalogService,
  ChatService,
  OrderService,
  ChatRealtimeEvent,
  ChatRealtimeListener,
  CreateOrderInput,
  LoginInput,
  MessagesPageOptions,
  MessagesPageResult,
  RegisterInput,
  SaveAddressInput,
  SendMessageOptions,
  UpdateProfileInput,
} from './types';
