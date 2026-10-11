import { z } from 'zod';
import {
  AddressSchema,
  ORDER_STATUS_SEQUENCE,
  type Address,
  type Order,
  type OrderStatus,
  type Product,
  type ProductCategory,
  type User,
} from '@attieke-chat/shared';
import { buildOrderTimeline, INITIAL_ADDRESSES } from '@/data/mock/seed';
import { loadMockState, saveMockState } from './storage';
import type {
  AuthService,
  CatalogService,
  CreateOrderInput,
  LoginInput,
  OrderService,
  RegisterInput,
  SaveAddressInput,
  UpdateProfileInput,
} from '../types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ============================================================================
// 1. MOCK AUTH SERVICE
// ============================================================================

const LoginValidationSchema = z.object({
  phoneOrEmail: z.string().trim().min(3),
  password: z.string().optional(),
});

const RegisterValidationSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().email().optional().or(z.literal('')),
  wechatId: z.string().optional(),
  preferredLocale: z.enum(['zh', 'fr', 'en']),
});

export class MockAuthService implements AuthService {
  public async getCurrentUser(): Promise<User | null> {
    await delay(80);
    const state = loadMockState();
    return state.currentUser ? structuredClone(state.currentUser) : null;
  }

  public async login(input: LoginInput): Promise<User> {
    const parsed = LoginValidationSchema.parse(input);
    await delay(220);
    const state = loadMockState();

    const user: User = state.currentUser ?? {
      id: 'user-client-01',
      name: parsed.phoneOrEmail.includes('@')
        ? parsed.phoneOrEmail.split('@')[0]
        : 'Li Mei (Awa Koné)',
      phone: parsed.phoneOrEmail.includes('@')
        ? '+86 138 0013 8000'
        : parsed.phoneOrEmail,
      email: parsed.phoneOrEmail.includes('@')
        ? parsed.phoneOrEmail
        : 'awa.kone@attieke-client.cn',
      wechatId: 'AwaKone_BJ88',
      preferredLocale: 'zh',
      addresses: [...INITIAL_ADDRESSES],
      createdAt: new Date().toISOString(),
    };

    state.currentUser = user;
    saveMockState(state);
    return structuredClone(user);
  }

  public async register(input: RegisterInput): Promise<User> {
    const parsed = RegisterValidationSchema.parse(input);
    await delay(260);
    const state = loadMockState();

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || undefined,
      wechatId: parsed.wechatId || undefined,
      preferredLocale: parsed.preferredLocale,
      addresses: [...INITIAL_ADDRESSES],
      createdAt: new Date().toISOString(),
    };

    state.currentUser = newUser;
    saveMockState(state);
    return structuredClone(newUser);
  }

  public async logout(): Promise<void> {
    await delay(100);
    const state = loadMockState();
    state.currentUser = null;
    saveMockState(state);
  }

  public async updateProfile(input: UpdateProfileInput): Promise<User> {
    const parsed = RegisterValidationSchema.parse(input);
    await delay(180);
    const state = loadMockState();
    if (!state.currentUser) {
      throw new Error('AUTH_REQUIRED');
    }

    state.currentUser = {
      ...state.currentUser,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || undefined,
      wechatId: parsed.wechatId || undefined,
      preferredLocale: parsed.preferredLocale,
    };

    saveMockState(state);
    return structuredClone(state.currentUser);
  }

  public async saveAddress(input: SaveAddressInput): Promise<User> {
    await delay(180);
    const state = loadMockState();
    if (!state.currentUser) {
      throw new Error('AUTH_REQUIRED');
    }

    const addressId = input.id ?? `addr-${Date.now()}`;
    const validated: Address = AddressSchema.parse({
      ...input,
      id: addressId,
    });

    const existingList = [...state.currentUser.addresses];
    if (validated.isDefault) {
      for (let i = 0; i < existingList.length; i += 1) {
        existingList[i] = { ...existingList[i], isDefault: false };
      }
    }

    const existingIndex = existingList.findIndex((a) => a.id === addressId);
    if (existingIndex >= 0) {
      existingList[existingIndex] = validated;
    } else {
      existingList.push(validated);
    }

    state.currentUser = {
      ...state.currentUser,
      addresses: existingList,
    };
    saveMockState(state);
    return structuredClone(state.currentUser);
  }

  public async deleteAddress(addressId: string): Promise<User> {
    await delay(140);
    const state = loadMockState();
    if (!state.currentUser) {
      throw new Error('AUTH_REQUIRED');
    }

    const filtered = state.currentUser.addresses.filter((a) => a.id !== addressId);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true };
    }

    state.currentUser = {
      ...state.currentUser,
      addresses: filtered,
    };
    saveMockState(state);
    return structuredClone(state.currentUser);
  }
}

// ============================================================================
// 2. MOCK CATALOG SERVICE
// ============================================================================

export class MockCatalogService implements CatalogService {
  public async getProducts(category?: ProductCategory): Promise<Product[]> {
    await delay(80);
    const state = loadMockState();
    const list = category
      ? state.products.filter((p) => p.category === category)
      : state.products;
    return structuredClone(list);
  }

  public async getFeaturedProducts(limit = 3): Promise<Product[]> {
    await delay(60);
    const state = loadMockState();
    const featured = state.products.filter((p) => p.featured).slice(0, limit);
    return structuredClone(featured);
  }

  public async getProductBySlug(slug: string): Promise<Product | null> {
    await delay(60);
    const state = loadMockState();
    const found = state.products.find((p) => p.slug === slug) ?? null;
    return found ? structuredClone(found) : null;
  }

  public async getProductById(id: string): Promise<Product | null> {
    await delay(60);
    const state = loadMockState();
    const found = state.products.find((p) => p.id === id) ?? null;
    return found ? structuredClone(found) : null;
  }
}

// ============================================================================
// 3. MOCK ORDER SERVICE
// ============================================================================

export class MockOrderService implements OrderService {
  public async getOrders(): Promise<Order[]> {
    await delay(100);
    const state = loadMockState();
    const sorted = [...state.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return structuredClone(sorted);
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    await delay(80);
    const state = loadMockState();
    const found = state.orders.find((o) => o.id === orderId) ?? null;
    return found ? structuredClone(found) : null;
  }

  public async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay(200);
    const state = loadMockState();
    const user = state.currentUser;
    const defaultAddress =
      user?.addresses.find((a) => a.isDefault) ??
      user?.addresses[0] ??
      INITIAL_ADDRESSES[0];

    const selectedAddress =
      (input.shippingAddressId
        ? user?.addresses.find((a) => a.id === input.shippingAddressId)
        : undefined) ?? defaultAddress;

    const subtotalYuan = input.items.reduce(
      (sum, item) => sum + item.unitPriceYuan * item.quantity,
      0
    );
    const shippingFeeYuan = 12;
    const totalYuan = subtotalYuan + shippingFeeYuan;
    const nowIso = new Date().toISOString();
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `OD${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}${String(Math.floor(100000 + Math.random() * 900000))}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: user?.id ?? 'user-client-01',
      items: input.items,
      subtotalYuan,
      shippingFeeYuan,
      totalYuan,
      currency: 'CNY',
      status: 'pending',
      shippingAddress: selectedAddress,
      timeline: buildOrderTimeline(orderId, 'pending', nowIso),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    state.orders.unshift(newOrder);
    saveMockState(state);
    return structuredClone(newOrder);
  }

  public async confirmOrder(orderId: string): Promise<Order> {
    await delay(180);
    const state = loadMockState();
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const target = state.orders[idx];
    const nextStatus: OrderStatus =
      target.status === 'pending' ? 'confirmed' : target.status;
    const updatedOrder: Order = {
      ...target,
      status: nextStatus,
      trackingNumber:
        target.trackingNumber ??
        `SF142899${String(Math.floor(1000000 + Math.random() * 9000000))}`,
      timeline: buildOrderTimeline(target.id, nextStatus, target.createdAt),
      updatedAt: new Date().toISOString(),
    };

    state.orders[idx] = updatedOrder;
    saveMockState(state);
    return structuredClone(updatedOrder);
  }

  public async advanceOrderStatus(orderId: string): Promise<Order> {
    await delay(180);
    const state = loadMockState();
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const target = state.orders[idx];
    const currentStepIdx = ORDER_STATUS_SEQUENCE.indexOf(target.status);
    const nextStatus: OrderStatus =
      currentStepIdx < ORDER_STATUS_SEQUENCE.length - 1
        ? ORDER_STATUS_SEQUENCE[currentStepIdx + 1]
        : target.status;

    const updatedOrder: Order = {
      ...target,
      status: nextStatus,
      trackingNumber:
        target.trackingNumber ??
        `SF142899${String(Math.floor(1000000 + Math.random() * 9000000))}`,
      timeline: buildOrderTimeline(target.id, nextStatus, target.createdAt),
      updatedAt: new Date().toISOString(),
    };

    state.orders[idx] = updatedOrder;
    saveMockState(state);
    return structuredClone(updatedOrder);
  }
}

export {
  MockCallService,
  MockChatService,
  sortConversations,
} from './mockChatService';
