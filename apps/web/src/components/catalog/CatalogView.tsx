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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* En-tête du Catalogue */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white px-3.5 py-1 text-xs font-extrabold text-brand-green">
          {dict.header.badge}
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
          {dict.header.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-ink-muted sm:text-base">
          {dict.header.subtitle}
        </p>
      </div>

      {/* Barre de recherche & Filtres par catégorie */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div
          role="group"
          aria-label={dict.filters.categoriesAria}
          className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:justify-start"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(cat.key)}
                className={`min-h-[40px] rounded-full border px-4 py-2 text-xs font-extrabold transition-all sm:text-sm ${
                  isSelected
                    ? 'border-brand-ink bg-brand-green text-white shadow-sm'
                    : 'border-brand-ink/15 bg-white text-brand-ink hover:bg-brand-green-soft'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.filters.searchPlaceholder}
            className="min-h-[42px] w-full rounded-full border border-brand-ink/15 bg-white px-4 py-2 text-sm text-brand-ink placeholder:text-brand-ink-muted focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>
      </div>

      {/* État de chargement */}
      {isLoading && (
        <div
          role="status"
          aria-label={dict.states.loading}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-[2rem] border border-brand-ink/10 bg-white p-4 shadow-sm animate-pulse"
            >
              <div className="aspect-[16/10] w-full rounded-2xl bg-brand-cream-subtle" />
              <div className="mt-4 h-5 w-3/4 rounded bg-brand-cream-subtle" />
              <div className="mt-2 h-4 w-full rounded bg-brand-cream-subtle" />
              <div className="mt-5 h-10 w-full rounded-full bg-brand-cream-subtle" />
            </div>
          ))}
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
      {!isLoading && !error && filteredProducts.length === 0 && (
        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-brand-ink/10 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-extrabold text-brand-ink">
            {dict.states.emptyTitle}
          </p>
          <p className="mt-1 text-xs text-brand-ink-muted">
            {dict.states.emptySubtitle}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 rounded-full border border-brand-ink bg-brand-gold px-5 py-2 text-xs font-extrabold text-brand-ink"
          >
            {dict.states.resetFilters}
          </button>
        </div>
      )}

      {/* Grille des 8 produits */}
      {!isLoading && !error && filteredProducts.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => {
            const name = product.name[locale];
            const shortDesc = product.shortDescription[locale];
            const formatLabel = product.formatLabel[locale];

            return (
              <article
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-[2rem] border border-brand-ink/10 bg-brand-cream-card shadow-card transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  <div
                    onClick={() => setActiveProduct(product)}
                    className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-brand-cream-subtle"
                  >
                    <Image
                      src={product.imageSrc}
                      alt={name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.featured && (
                      <span className="absolute top-3 left-3 rounded-full border border-brand-ink bg-brand-gold px-2.5 py-0.5 text-[11px] font-extrabold text-brand-ink">
                        ★ {dict.card.popular}
                      </span>
                    )}
                    <span className="absolute bottom-2.5 left-2.5 rounded-full bg-brand-ink/80 px-2.5 py-0.5 text-[10px] font-bold text-[#25D366]">
                      ● {dict.card.inStock}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-extrabold text-brand-ink">
                        {name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-brand-cream px-2.5 py-0.5 text-[11px] font-bold text-brand-ink">
                        {product.weightKg} {dict.card.weightUnit}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-brand-green">
                      {formatLabel}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-ink-muted">
                      {shortDesc}
                    </p>
                  </div>
                </div>

                <div className="border-t border-brand-ink/10 p-5 pt-3.5">
                  <div className="mb-3 flex items-baseline justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveProduct(product)}
                      className="text-xs font-extrabold text-brand-green underline hover:text-brand-green-dark"
                    >
                      {dict.card.viewDetailsButton}
                    </button>
                    <span className="text-xl font-extrabold text-brand-green">
                      {formatPriceYuan(product.priceYuan, locale)}
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/chat?product=${encodeURIComponent(product.slug)}`}
                    className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-brand-ink bg-brand-gold px-4 py-2.5 text-xs font-extrabold text-brand-ink transition-colors hover:bg-brand-gold-hover sm:text-sm"
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
