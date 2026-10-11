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
      return 'bg-wa-system-bg text-wa-system-text border-wa-border';
    case 'confirmed':
    case 'paid':
      return 'bg-wa-read-tick/15 text-wa-text-primary border-wa-border';
    case 'shipped':
    case 'customs':
    case 'in_china_transit':
      return 'bg-wa-system-bg text-wa-system-text border-wa-border';
    case 'delivered':
      return 'bg-wa-accent/15 text-wa-dark-green dark:text-wa-accent border-wa-border';
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* En-tête */}
      <div className="overflow-hidden rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center rounded-full bg-wa-accent/15 px-3 py-0.5 text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent">
              {dict.header.badge}
            </span>
            <h1 className="mt-1.5 wa-text-title text-wa-text-primary">
              {dict.header.title}
            </h1>
            <p className="mt-1 text-wa-body text-wa-text-secondary">
              {dict.header.subtitle}
            </p>
          </div>

          {/* Filtres Toutes / En cours / Livrées */}
          <div className="flex flex-wrap gap-2">
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
                  className={`min-h-[40px] rounded-full px-4 py-1.5 text-wa-preview font-semibold transition-colors duration-fast ${
                    isSelected
                      ? 'bg-wa-accent text-white shadow-wa-bubble'
                      : 'bg-wa-composer text-wa-text-secondary hover:text-wa-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div
          role="status"
          aria-label={dict.states.loading}
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          <div className="space-y-4 lg:col-span-5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-32 rounded-2xl bg-wa-panel p-5 shadow-wa-bubble animate-pulse"
              />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-wa-panel p-6 shadow-wa-bubble animate-pulse lg:col-span-7" />
        </div>
      )}

      {/* État d'erreur */}
      {!isLoading && error && (
        <div
          role="alert"
          className="mx-auto mt-8 max-w-md rounded-2xl border border-red-300 bg-wa-panel p-6 text-center shadow-wa-bubble"
        >
          <p className="text-wa-preview font-semibold text-red-600">
            {dict.states.error}
          </p>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 min-h-[44px] rounded-full bg-wa-header px-5 py-2 text-wa-preview font-semibold text-white"
          >
            {dict.states.retry}
          </button>
        </div>
      )}

      {/* État vide */}
      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-wa-border bg-wa-panel p-8 text-center shadow-wa-bubble">
          <p className="text-wa-contact font-medium text-wa-text-primary">
            {dict.states.emptyTitle}
          </p>
          <p className="mt-1 text-wa-preview text-wa-text-secondary">
            {dict.states.emptySubtitle}
          </p>
          <Link
            href={`/${locale}/chat`}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-wa-bubble bg-wa-commerce px-6 py-2.5 text-wa-preview font-semibold text-wa-commerce-text shadow-wa-bubble"
          >
            {dict.states.goToChatCta} →
          </Link>
        </div>
      )}

      {/* Liste des commandes (gauche) + Détail & Frise des 7 étapes (droite) */}
      {!isLoading && !error && filteredOrders.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Colonne Liste des commandes */}
          <div className="space-y-3 lg:col-span-5">
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
                  className={`cursor-pointer rounded-2xl border p-4 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-wa-accent ${
                    isSelected
                      ? 'border-wa-accent bg-wa-panel ring-1 ring-wa-accent shadow-wa-panel'
                      : 'border-wa-border bg-wa-panel hover:bg-wa-composer shadow-wa-bubble'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-wa-meta font-semibold text-wa-text-secondary">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-0.5 text-wa-meta font-semibold ${getStatusBadgeStyle(
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
                          className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-wa-panel bg-wa-composer"
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
                      <p className="truncate text-wa-contact font-medium text-wa-text-primary">
                        {order.items
                          .map((i) => i.productName[locale])
                          .join(' + ')}
                      </p>
                      <p className="text-wa-meta text-wa-text-secondary">
                        {totalQty} {dict.list.itemsCount} ·{' '}
                        {formatDateTime(order.createdAt, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-wa-border pt-2.5">
                    <span className="text-wa-contact font-semibold text-wa-dark-green dark:text-wa-accent">
                      {formatPriceYuan(order.totalYuan, locale)}
                    </span>
                    <span className="text-wa-meta font-semibold text-wa-text-secondary underline">
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
              <div className="rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel">
                {/* En-tête du détail */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-wa-border pb-4">
                  <div>
                    <p className="text-wa-meta text-wa-text-secondary">
                      {dict.list.orderNumber}: #{activeOrder.orderNumber}
                    </p>
                    <h2 className="mt-0.5 wa-text-title text-wa-text-primary">
                      {statusDict[activeOrder.status]}
                    </h2>
                    {activeOrder.trackingNumber && (
                      <p className="mt-1 text-wa-meta font-medium text-wa-dark-green dark:text-wa-accent">
                        📦 {dict.list.trackingNumber}:{' '}
                        <span className="font-mono font-semibold">
                          {activeOrder.trackingNumber}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Boutons d'action : Confirmer la commande (#F2B705) ou Simuler l'étape suivante */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeOrder.status === 'pending' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void confirmOrder(activeOrder.id)}
                        className="min-h-[44px] rounded-wa-bubble bg-wa-commerce px-5 py-2 text-wa-preview font-semibold text-wa-commerce-text shadow-wa-bubble hover:bg-wa-commerce-hover disabled:opacity-60"
                      >
                        ✓ {dict.list.confirmNow}
                      </button>
                    )}

                    {activeOrder.status !== 'delivered' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void advanceOrderStatus(activeOrder.id)}
                        className="min-h-[44px] rounded-wa-bubble bg-wa-accent px-5 py-2 text-wa-preview font-semibold text-white shadow-wa-bubble hover:opacity-95 disabled:opacity-60"
                      >
                        🚚 {dict.list.simulateNextStep}
                      </button>
                    )}

                    <Link
                      href={`/${locale}/chat`}
                      className="flex min-h-[44px] items-center rounded-wa-bubble border border-wa-border bg-wa-composer px-4 py-2 text-wa-preview font-medium text-wa-text-primary hover:bg-wa-border/60"
                    >
                      💬 {dict.list.askInChat}
                    </Link>
                  </div>
                </div>

                {/* Frise des 7 étapes de suivi */}
                <div className="mt-5">
                  <h3 className="text-wa-meta font-semibold uppercase tracking-wider text-wa-dark-green dark:text-wa-accent">
                    {dict.detail.timelineTitle}
                  </h3>

                  <ol className="relative mt-4 space-y-2.5">
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
                          className={`relative flex items-start justify-between gap-4 rounded-xl border p-3 transition-colors duration-fast ${
                            isStepCurrent
                              ? 'border-wa-border bg-wa-system-bg'
                              : isStepCompleted
                              ? 'border-wa-border bg-wa-bubble-out/40'
                              : 'border-wa-border bg-wa-composer/50 opacity-80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-wa-meta font-semibold ${
                                isStepCompleted
                                  ? 'bg-wa-accent text-white'
                                  : isStepCurrent
                                  ? 'bg-wa-header text-white'
                                  : 'bg-wa-composer text-wa-text-secondary'
                              }`}
                            >
                              {isStepCompleted ? '✓' : idx + 1}
                            </span>

                            <div>
                              <p className="text-wa-preview font-medium text-wa-text-primary">
                                {idx + 1}. {statusDict[stepStatus]}
                              </p>
                              {event ? (
                                <>
                                  <p className="text-wa-meta font-medium text-wa-dark-green dark:text-wa-accent">
                                    📍 {event.location[locale]}
                                  </p>
                                  <p className="mt-0.5 text-wa-meta text-wa-text-secondary">
                                    {event.note[locale]}
                                  </p>
                                  <p className="mt-0.5 text-wa-meta text-wa-text-secondary">
                                    {formatDateTime(event.timestamp, locale)}
                                  </p>
                                </>
                              ) : (
                                <p className="mt-0.5 text-wa-meta text-wa-text-secondary">
                                  {dict.detail.upcomingSteps[stepStatus]}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-wa-meta font-semibold ${
                              isStepCompleted
                                ? 'bg-wa-accent text-white'
                                : isStepCurrent
                                ? 'bg-wa-header text-white'
                                : 'bg-wa-composer text-wa-text-secondary'
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
                <div className="mt-6 grid grid-cols-1 gap-6 border-t border-wa-border pt-5 sm:grid-cols-2">
                  <div>
                    <h3 className="text-wa-meta font-semibold uppercase tracking-wider text-wa-text-secondary">
                      {dict.detail.itemsTitle}
                    </h3>
                    <ul className="mt-2.5 space-y-2">
                      {activeOrder.items.map((item) => (
                        <li
                          key={`${activeOrder.id}-detail-${item.productId}`}
                          className="flex items-center justify-between text-wa-preview"
                        >
                          <span className="text-wa-text-primary">
                            {item.productName[locale]} ({item.weightKg} kg) ×{' '}
                            {item.quantity}
                          </span>
                          <span className="font-semibold text-wa-dark-green dark:text-wa-accent">
                            {formatPriceYuan(
                              item.unitPriceYuan * item.quantity,
                              locale
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 space-y-1 border-t border-wa-border pt-3 text-wa-preview">
                      <div className="flex justify-between text-wa-text-secondary">
                        <span>{dict.detail.subtotal}</span>
                        <span>
                          {formatPriceYuan(activeOrder.subtotalYuan, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between text-wa-text-secondary">
                        <span>{dict.detail.shipping}</span>
                        <span>
                          {formatPriceYuan(activeOrder.shippingFeeYuan, locale)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 text-wa-contact font-semibold text-wa-dark-green dark:text-wa-accent">
                        <span>{dict.detail.total}</span>
                        <span>
                          {formatPriceYuan(activeOrder.totalYuan, locale)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Adresse de livraison en Chine */}
                  <div className="rounded-xl bg-wa-composer p-4 text-wa-preview">
                    <h3 className="text-wa-meta font-semibold uppercase tracking-wider text-wa-dark-green dark:text-wa-accent">
                      📍 {dict.detail.addressTitle}
                    </h3>
                    <p className="mt-1.5 font-medium text-wa-text-primary">
                      {activeOrder.shippingAddress.label}
                    </p>
                    <p className="mt-1 text-wa-text-primary">
                      {activeOrder.shippingAddress.province}{' '}
                      {activeOrder.shippingAddress.city}{' '}
                      {activeOrder.shippingAddress.district}
                      <br />
                      {activeOrder.shippingAddress.streetAddress}
                    </p>
                    <p className="mt-1.5 text-wa-meta text-wa-text-secondary">
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
