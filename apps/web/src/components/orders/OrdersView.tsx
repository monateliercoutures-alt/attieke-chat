'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ORDER_STATUS_SEQUENCE,
  type Locale,
  type OrderStatus,
} from '@attieke-chat/shared';
import type { CommonDictionary, OrdersDictionary } from '@/lib/i18n';
import { formatDateTime, formatPriceYuan } from '@/lib/i18n';
import { useOrders } from '@/hooks/useOrders';

interface OrdersViewProps {
  locale: Locale;
  dict: OrdersDictionary;
  statusDict: CommonDictionary['orderStatus'];
}

type OrderFilter = 'all' | 'active' | 'delivered';

function getStatusBadgeStyle(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'confirmed':
    case 'paid':
      return 'bg-sky-100 text-sky-900 border-sky-300';
    case 'shipped':
    case 'customs':
    case 'in_china_transit':
      return 'bg-brand-gold-light text-amber-900 border-brand-gold';
    case 'delivered':
      return 'bg-brand-green-soft text-brand-green border-brand-green/30';
  }
}

export function OrdersView({
  locale,
  dict,
  statusDict,
}: OrdersViewProps): React.JSX.Element {
  const {
    orders,
    selectedOrder,
    setSelectedOrderId,
    isLoading,
    isUpdating,
    error,
    confirmOrder,
    advanceOrderStatus,
    reload,
  } = useOrders();

  const [filter, setFilter] = useState<OrderFilter>('all');

  const filteredOrders = useMemo(() => {
    if (filter === 'active') {
      return orders.filter((o) => o.status !== 'delivered');
    }
    if (filter === 'delivered') {
      return orders.filter((o) => o.status === 'delivered');
    }
    return orders;
  }, [orders, filter]);

  const activeOrder =
    filteredOrders.find((o) => o.id === selectedOrder?.id) ??
    filteredOrders[0] ??
    null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* En-tête */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white px-3.5 py-1 text-xs font-extrabold text-brand-green">
          {dict.header.badge}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
          {dict.header.title}
        </h1>
        <p className="mt-2.5 text-sm text-brand-ink-muted sm:text-base">
          {dict.header.subtitle}
        </p>
      </div>

      {/* Filtres Toutes / En cours / Livrées */}
      <div className="mt-8 flex justify-center gap-2">
        {(
          [
            { key: 'all', label: dict.filters.all },
            { key: 'active', label: dict.filters.active },
            { key: 'delivered', label: dict.filters.delivered },
          ] as const
        ).map((tab) => {
          const isSelected = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setFilter(tab.key)}
              className={`min-h-[42px] rounded-full border px-5 py-2 text-xs font-extrabold transition-all sm:text-sm ${
                isSelected
                  ? 'border-brand-ink bg-brand-green text-white shadow-sm'
                  : 'border-brand-ink/15 bg-white text-brand-ink hover:bg-brand-green-soft'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div
          role="status"
          aria-label={dict.states.loading}
          className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <div className="space-y-4 lg:col-span-5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-32 rounded-3xl bg-white p-5 shadow-sm animate-pulse"
              />
            ))}
          </div>
          <div className="h-96 rounded-3xl bg-white p-6 shadow-sm animate-pulse lg:col-span-7" />
        </div>
      )}

      {/* État d'erreur */}
      {!isLoading && error && (
        <div
          role="alert"
          className="mx-auto mt-10 max-w-md rounded-3xl border border-red-200 bg-white p-6 text-center"
        >
          <p className="text-sm font-bold text-red-700">{dict.states.error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 rounded-full bg-brand-gold px-5 py-2 text-xs font-extrabold text-brand-ink"
          >
            {dict.states.retry}
          </button>
        </div>
      )}

      {/* État vide */}
      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-brand-ink/10 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-extrabold text-brand-ink">
            {dict.states.emptyTitle}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            {dict.states.emptySubtitle}
          </p>
          <Link
            href={`/${locale}/chat`}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-ink bg-brand-gold px-6 py-2.5 text-xs font-extrabold text-brand-ink"
          >
            {dict.states.goToChatCta} →
          </Link>
        </div>
      )}

      {/* Liste des commandes (gauche) + Détail & Frise des 7 étapes (droite) */}
      {!isLoading && !error && filteredOrders.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Colonne Liste des commandes */}
          <div className="space-y-4 lg:col-span-5">
            {filteredOrders.map((order) => {
              const isSelected = activeOrder?.id === order.id;
              const totalQty = order.items.reduce(
                (acc, item) => acc + item.quantity,
                0
              );

              return (
                <article
                  key={order.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedOrderId(order.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedOrderId(order.id);
                    }
                  }}
                  className={`cursor-pointer rounded-[1.75rem] border p-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                    isSelected
                      ? 'border-brand-green bg-white ring-2 ring-brand-green shadow-card'
                      : 'border-brand-ink/10 bg-white/90 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-brand-ink">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-[11px] font-extrabold ${getStatusBadgeStyle(
                        order.status
                      )}`}
                    >
                      {statusDict[order.status]}
                    </span>
                  </div>

                  {/* Miniatures des produits */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      {order.items.map((item) => (
                        <div
                          key={`${order.id}-${item.productId}`}
                          className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-brand-cream-subtle"
                        >
                          <Image
                            src={item.productImage}
                            alt={item.productName[locale]}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-brand-ink">
                        {order.items
                          .map((i) => i.productName[locale])
                          .join(' + ')}
                      </p>
                      <p className="text-xs text-brand-ink-muted">
                        {totalQty} {dict.list.itemsCount} ·{' '}
                        {formatDateTime(order.createdAt, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-brand-ink/10 pt-3">
                    <span className="text-base font-extrabold text-brand-green">
                      {formatPriceYuan(order.totalYuan, locale)}
                    </span>
                    <span className="text-xs font-extrabold text-brand-ink underline">
                      {dict.list.viewDetails} →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Colonne Détail de la commande sélectionnée + Frise des 7 étapes */}
          {activeOrder && (
            <div className="lg:col-span-7">
              <div className="rounded-[2rem] border border-brand-ink/10 bg-white p-6 shadow-card sm:p-8">
                {/* En-tête du détail */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-ink/10 pb-5">
                  <div>
                    <p className="text-xs font-bold text-brand-ink-muted">
                      {dict.list.orderNumber}: #{activeOrder.orderNumber}
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-brand-ink sm:text-2xl">
                      {statusDict[activeOrder.status]}
                    </h2>
                    {activeOrder.trackingNumber && (
                      <p className="mt-1 text-xs font-semibold text-brand-green">
                        📦 {dict.list.trackingNumber}:{' '}
                        <span className="font-mono font-bold">
                          {activeOrder.trackingNumber}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Boutons d'action de simulation ou confirmation */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeOrder.status === 'pending' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void confirmOrder(activeOrder.id)}
                        className="rounded-full bg-brand-green px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-brand-green-dark disabled:opacity-60"
                      >
                        ✓ {dict.list.confirmNow}
                      </button>
                    )}

                    {activeOrder.status !== 'delivered' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void advanceOrderStatus(activeOrder.id)}
                        className="rounded-full border border-brand-ink bg-brand-gold px-5 py-2.5 text-xs font-extrabold text-brand-ink shadow-sm hover:bg-brand-gold-hover disabled:opacity-60"
                      >
                        🚚 {dict.list.simulateNextStep}
                      </button>
                    )}

                    <Link
                      href={`/${locale}/chat`}
                      className="rounded-full border border-brand-ink/15 bg-brand-cream px-4 py-2.5 text-xs font-bold text-brand-ink hover:bg-brand-green-soft"
                    >
                      💬 {dict.list.askInChat}
                    </Link>
                  </div>
                </div>

                {/* Frise des 7 étapes de suivi (en attente -> confirmée -> payée -> expédiée -> en douane -> livrée en Chine -> livrée au client) */}
                <div className="mt-6">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-green">
                    {dict.detail.timelineTitle}
                  </h3>

                  <ol className="relative mt-5 space-y-3.5">
                    {ORDER_STATUS_SEQUENCE.map((stepStatus, idx) => {
                      const currentIdx = ORDER_STATUS_SEQUENCE.indexOf(
                        activeOrder.status
                      );
                      const isDelivered = activeOrder.status === 'delivered';
                      const isStepCompleted = idx < currentIdx || isDelivered;
                      const isStepCurrent = idx === currentIdx && !isDelivered;
                      const event = activeOrder.timeline.find(
                        (e) => e.status === stepStatus
                      );

                      return (
                        <li
                          key={stepStatus}
                          className={`relative flex items-start justify-between gap-4 rounded-2xl border p-3.5 transition-colors ${
                            isStepCurrent
                              ? 'border-brand-gold bg-brand-gold-light/70 shadow-sm'
                              : isStepCompleted
                              ? 'border-brand-green/20 bg-brand-green-soft/35'
                              : 'border-brand-ink/10 bg-brand-cream/40 opacity-75'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                                isStepCompleted
                                  ? 'bg-brand-green text-white'
                                  : isStepCurrent
                                  ? 'bg-brand-gold text-brand-ink ring-4 ring-brand-gold/30'
                                  : 'bg-brand-cream-subtle text-brand-ink-muted'
                              }`}
                            >
                              {isStepCompleted ? '✓' : idx + 1}
                            </span>

                            <div>
                              <p className="text-sm font-extrabold text-brand-ink">
                                {idx + 1}. {statusDict[stepStatus]}
                              </p>
                              {event ? (
                                <>
                                  <p className="text-xs font-semibold text-brand-green">
                                    📍 {event.location[locale]}
                                  </p>
                                  <p className="mt-0.5 text-xs text-brand-ink-muted">
                                    {event.note[locale]}
                                  </p>
                                  <p className="mt-1 text-[11px] text-brand-ink-muted/80">
                                    {formatDateTime(event.timestamp, locale)}
                                  </p>
                                </>
                              ) : (
                                <p className="mt-0.5 text-xs text-brand-ink-muted">
                                  {dict.detail.upcomingSteps[stepStatus]}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                              isStepCompleted
                                ? 'bg-brand-green text-white'
                                : isStepCurrent
                                ? 'bg-brand-gold text-brand-ink'
                                : 'bg-brand-cream-subtle text-brand-ink-muted'
                            }`}
                          >
                            {isStepCompleted
                              ? dict.detail.stepCompleted
                              : isStepCurrent
                              ? dict.detail.stepCurrent
                              : dict.detail.stepUpcoming}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Articles commandés & Récapitulatif financier */}
                <div className="mt-8 grid grid-cols-1 gap-6 border-t border-brand-ink/10 pt-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-ink-muted">
                      {dict.detail.itemsTitle}
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {activeOrder.items.map((item) => (
                        <li
                          key={`${activeOrder.id}-detail-${item.productId}`}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-brand-ink">
                            {item.productName[locale]} ({item.weightKg} kg) ×{' '}
                            {item.quantity}
                          </span>
                          <span className="font-extrabold text-brand-green">
                            {formatPriceYuan(
                              item.unitPriceYuan * item.quantity,
                              locale
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 space-y-1 border-t border-brand-ink/10 pt-3 text-xs">
                      <div className="flex justify-between text-brand-ink-muted">
                        <span>{dict.detail.subtotal}</span>
                        <span>
                          {formatPriceYuan(activeOrder.subtotalYuan, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between text-brand-ink-muted">
                        <span>{dict.detail.shipping}</span>
                        <span>
                          {formatPriceYuan(activeOrder.shippingFeeYuan, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 text-sm font-extrabold text-brand-green">
                        <span>{dict.detail.total}</span>
                        <span>
                          {formatPriceYuan(activeOrder.totalYuan, locale)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Adresse de livraison en Chine */}
                  <div className="rounded-2xl bg-brand-cream p-4 text-xs">
                    <h3 className="font-extrabold uppercase tracking-wider text-brand-green">
                      📍 {dict.detail.addressTitle}
                    </h3>
                    <p className="mt-2 font-extrabold text-brand-ink">
                      {activeOrder.shippingAddress.label}
                    </p>
                    <p className="mt-1 leading-relaxed text-brand-ink">
                      {activeOrder.shippingAddress.province}{' '}
                      {activeOrder.shippingAddress.city}{' '}
                      {activeOrder.shippingAddress.district}
                      <br />
                      {activeOrder.shippingAddress.streetAddress}
                    </p>
                    <p className="mt-2 font-semibold text-brand-ink-muted">
                      {activeOrder.shippingAddress.recipientName} ·{' '}
                      {activeOrder.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
