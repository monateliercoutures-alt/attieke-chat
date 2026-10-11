'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale, Product, ProductCategory } from '@attieke-chat/shared';
import type { CatalogDictionary } from '@/lib/i18n';
import { formatPriceYuan } from '@/lib/i18n';
import { useProducts } from '@/hooks/useCatalog';
import { ProductDetailModal } from './ProductDetailModal';

interface CatalogViewProps {
  locale: Locale;
  dict: CatalogDictionary;
}

export function CatalogView({
  locale,
  dict,
}: CatalogViewProps): React.JSX.Element {
  const {
    products,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    reload,
  } = useProducts('all');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const categories: ReadonlyArray<{
    key: ProductCategory | 'all';
    label: string;
  }> = [
    { key: 'all', label: dict.filters.all },
    { key: 'attieke', label: dict.filters.attieke },
    { key: 'combo_fish', label: dict.filters.combo_fish },
    { key: 'combo_meat', label: dict.filters.combo_meat },
    { key: 'condiment', label: dict.filters.condiment },
  ];

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter(
      (p) =>
        p.name[locale].toLowerCase().includes(query) ||
        p.shortDescription[locale].toLowerCase().includes(query) ||
        p.formatLabel[locale].toLowerCase().includes(query)
    );
  }, [products, searchQuery, locale]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* En-tête du Catalogue */}
      <div className="overflow-hidden rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
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

          <div className="relative w-full md:w-72">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.filters.searchPlaceholder}
              className="min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-preview text-wa-text-primary placeholder:text-wa-text-secondary focus:outline-none focus:ring-2 focus:ring-wa-accent"
            />
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div
          role="group"
          aria-label={dict.filters.categoriesAria}
          className="mt-5 flex flex-wrap items-center gap-2 border-t border-wa-border pt-4"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(cat.key)}
                className={`min-h-[40px] rounded-full px-4 py-1.5 text-wa-preview font-semibold transition-colors duration-fast ${
                  isSelected
                    ? 'bg-wa-accent text-white shadow-wa-bubble'
                    : 'bg-wa-composer text-wa-text-secondary hover:text-wa-text-primary'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div
          role="status"
          aria-label={dict.states.loading}
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-wa-border bg-wa-panel p-4 shadow-wa-bubble animate-pulse"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-wa-composer" />
              <div className="mt-4 h-5 w-3/4 rounded bg-wa-composer" />
              <div className="mt-2 h-4 w-full rounded bg-wa-composer" />
              <div className="mt-5 h-10 w-full rounded-full bg-wa-composer" />
            </div>
          ))}
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
      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-wa-border bg-wa-panel p-8 text-center shadow-wa-bubble">
          <p className="text-wa-contact font-medium text-wa-text-primary">
            {dict.states.emptyTitle}
          </p>
          <p className="mt-1 text-wa-preview text-wa-text-secondary">
            {dict.states.emptySubtitle}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 min-h-[44px] rounded-full bg-wa-header px-5 py-2 text-wa-preview font-semibold text-white"
          >
            {dict.states.resetFilters}
          </button>
        </div>
      )}

      {/* Grille des 8 produits */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            const name = product.name[locale];
            const shortDesc = product.shortDescription[locale];
            const formatLabel = product.formatLabel[locale];

            return (
              <article
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-wa-border bg-wa-panel shadow-wa-bubble transition-transform duration-fast hover:-translate-y-0.5"
              >
                <div>
                  <div
                    onClick={() => setActiveProduct(product)}
                    className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-wa-composer"
                  >
                    <Image
                      src={product.imageSrc}
                      alt={name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      className="object-cover transition-transform duration-normal group-hover:scale-105"
                    />
                    {product.featured && (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-wa-system-bg px-2.5 py-0.5 text-wa-meta font-semibold text-wa-system-text shadow-wa-bubble">
                        ★ {dict.card.popular}
                      </span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-wa-panel/90 px-2.5 py-0.5 text-wa-meta font-semibold text-wa-accent">
                      ● {dict.card.inStock}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-wa-contact font-medium text-wa-text-primary">
                        {name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-wa-composer px-2.5 py-0.5 text-wa-meta font-medium text-wa-text-secondary">
                        {product.weightKg} {dict.card.weightUnit}
                      </span>
                    </div>
                    <p className="mt-0.5 text-wa-meta font-medium text-wa-dark-green dark:text-wa-accent">
                      {formatLabel}
                    </p>
                    <p className="mt-2 line-clamp-2 text-wa-preview text-wa-text-secondary">
                      {shortDesc}
                    </p>
                  </div>
                </div>

                <div className="border-t border-wa-border p-4 pt-3">
                  <div className="mb-3 flex items-baseline justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveProduct(product)}
                      className="text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent underline hover:opacity-80"
                    >
                      {dict.card.viewDetailsButton}
                    </button>
                    <span className="text-wa-title font-semibold text-wa-dark-green dark:text-wa-accent">
                      {formatPriceYuan(product.priceYuan, locale)}
                    </span>
                  </div>

                  {/* Bouton de commerce : Jaune doré #F2B705 ("Commander par chat") */}
                  <Link
                    href={`/${locale}/chat?product=${encodeURIComponent(
                      product.slug
                    )}`}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-wa-bubble bg-wa-commerce px-4 py-2 text-wa-preview font-semibold text-wa-commerce-text shadow-wa-bubble transition-colors duration-fast hover:bg-wa-commerce-hover"
                  >
                    <span aria-hidden="true">💬</span>
                    <span>{dict.card.orderByChatButton}</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modale Détail Produit */}
      <ProductDetailModal
        product={activeProduct}
        locale={locale}
        dict={dict.detailModal}
        cardDict={dict.card}
        onClose={() => setActiveProduct(null)}
      />
    </section>
  );
}
