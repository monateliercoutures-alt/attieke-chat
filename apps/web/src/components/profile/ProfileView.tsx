'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  SUPPORTED_LOCALES,
  type Address,
  type Locale,
} from '@attieke-chat/shared';
import type { ProfileDictionary } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { AuthView } from '@/components/auth/AuthView';

interface ProfileViewProps {
  locale: Locale;
  dict: ProfileDictionary;
}

const ProfileUpdateFormSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().email().optional().or(z.literal('')),
  wechatId: z.string().optional(),
  preferredLocale: z.enum(['zh', 'fr', 'en']),
});

const AddressFormSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1),
  recipientName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  province: z.string().trim().min(1),
  city: z.string().trim().min(1),
  district: z.string().trim().min(1),
  streetAddress: z.string().trim().min(2),
  postalCode: z.string().optional(),
  isDefault: z.boolean(),
});

export function ProfileView({
  locale,
  dict,
}: ProfileViewProps): React.JSX.Element {
  const router = useRouter();
  const {
    user,
    isLoading,
    isSaving,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    resetDemoData,
  } = useAuth();

  // États du formulaire profil
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [wechatId, setWechatId] = useState<string>('');
  const [preferredLocale, setPreferredLocale] = useState<Locale>(locale);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // États du gestionnaire d'adresses en Chine
  const [isAddressFormOpen, setIsAddressFormOpen] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | undefined>(
    undefined
  );
  const [addrLabel, setAddrLabel] = useState<string>('');
  const [addrRecipient, setAddrRecipient] = useState<string>('');
  const [addrPhone, setAddrPhone] = useState<string>('+86 ');
  const [addrProvince, setAddrProvince] = useState<string>('');
  const [addrCity, setAddrCity] = useState<string>('');
  const [addrDistrict, setAddrDistrict] = useState<string>('');
  const [addrStreet, setAddrStreet] = useState<string>('');
  const [addrPostalCode, setAddrPostalCode] = useState<string>('');
  const [addrIsDefault, setAddrIsDefault] = useState<boolean>(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email ?? '');
      setWechatId(user.wechatId ?? '');
      setPreferredLocale(user.preferredLocale);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setProfileFeedback(null);
    setProfileError(null);

    const parsed = ProfileUpdateFormSchema.safeParse({
      name,
      phone,
      email,
      wechatId,
      preferredLocale,
    });

    if (!parsed.success) {
      setProfileError(dict.auth.validationError);
      return;
    }

    await updateProfile({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      wechatId: parsed.data.wechatId || undefined,
      preferredLocale: parsed.data.preferredLocale,
    });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'attieke_chat_locale',
        parsed.data.preferredLocale
      );
      document.cookie = `NEXT_LOCALE=${parsed.data.preferredLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    setProfileFeedback(dict.profileForm.savedToast);

    if (parsed.data.preferredLocale !== locale) {
      router.push(`/${parsed.data.preferredLocale}/profile`);
    }
  };

  const handleResetDemo = async (): Promise<void> => {
    setProfileFeedback(null);
    setProfileError(null);
    await resetDemoData();
    setProfileFeedback(dict.profileForm.resetDemoToast);
  };

  const openNewAddressForm = (): void => {
    setEditingAddressId(undefined);
    setAddrLabel('');
    setAddrRecipient(user?.name ?? '');
    setAddrPhone(user?.phone ?? '+86 ');
    setAddrProvince('');
    setAddrCity('');
    setAddrDistrict('');
    setAddrStreet('');
    setAddrPostalCode('');
    setAddrIsDefault((user?.addresses.length ?? 0) === 0);
    setAddressError(null);
    setIsAddressFormOpen(true);
  };

  const openEditAddressForm = (address: Address): void => {
    setEditingAddressId(address.id);
    setAddrLabel(address.label);
    setAddrRecipient(address.recipientName);
    setAddrPhone(address.phone);
    setAddrProvince(address.province);
    setAddrCity(address.city);
    setAddrDistrict(address.district);
    setAddrStreet(address.streetAddress);
    setAddrPostalCode(address.postalCode ?? '');
    setAddrIsDefault(address.isDefault);
    setAddressError(null);
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setAddressError(null);

    const parsed = AddressFormSchema.safeParse({
      id: editingAddressId,
      label: addrLabel,
      recipientName: addrRecipient,
      phone: addrPhone,
      province: addrProvince,
      city: addrCity,
      district: addrDistrict,
      streetAddress: addrStreet,
      postalCode: addrPostalCode || undefined,
      isDefault: addrIsDefault,
    });

    if (!parsed.success) {
      setAddressError(dict.auth.validationError);
      return;
    }

    await saveAddress(parsed.data);
    setIsAddressFormOpen(false);
  };

  const handleSetDefaultAddress = async (address: Address): Promise<void> => {
    await saveAddress({
      ...address,
      isDefault: true,
    });
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-2xl bg-wa-panel" />
      </section>
    );
  }

  if (!user) {
    return <AuthView locale={locale} dict={dict} />;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* En-tête du profil */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-[49px] w-[49px] shrink-0 items-center justify-center rounded-full bg-wa-header text-wa-title text-white shadow-wa-bubble">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-wa-accent/15 px-2.5 py-0.5 text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent">
              {dict.header.badge}
            </span>
            <h1 className="mt-1 wa-text-title text-wa-text-primary">
              {user.name}
            </h1>
            <p className="text-wa-preview text-wa-text-secondary">
              {user.phone}{' '}
              {user.wechatId
                ? `• ${dict.profileForm.wechatLabel}: ${user.wechatId}`
                : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleResetDemo()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-wa-border bg-wa-composer px-4 py-2 text-wa-preview font-medium text-wa-text-primary transition-colors duration-fast hover:bg-wa-border/60 disabled:opacity-60"
          >
            ↺ {dict.profileForm.resetDemoButton}
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-red-200 bg-red-50 px-5 py-2 text-wa-preview font-semibold text-red-700 transition-colors duration-fast hover:bg-red-100"
          >
            {dict.profileForm.logoutButton}
          </button>
        </div>
      </div>

      {/* Grille principale : Informations personnelles + Adresses en Chine */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Colonne Gauche : Formulaire d'informations personnelles & Langue */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel">
            <h2 className="wa-text-title text-wa-text-primary">
              {dict.profileForm.sectionTitle}
            </h2>
            <p className="mt-1 text-wa-preview text-wa-text-secondary">
              {dict.header.subtitle}
            </p>

            {profileFeedback && (
              <div
                role="status"
                aria-live="polite"
                className="mt-4 rounded-xl bg-wa-bubble-out px-4 py-3 text-wa-preview font-medium text-wa-text-primary"
              >
                ✓ {profileFeedback}
              </div>
            )}

            {profileError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-wa-preview font-semibold text-red-700"
              >
                {profileError}
              </div>
            )}

            <form
              onSubmit={(e) => void handleSaveProfile(e)}
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-wa-preview font-medium text-wa-text-primary"
                >
                  {dict.profileForm.nameLabel}
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-wa-preview font-medium text-wa-text-primary"
                >
                  {dict.profileForm.phoneLabel}
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-wa-preview font-medium text-wa-text-primary"
                  >
                    {dict.profileForm.emailLabel}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-3.5 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-wechat"
                    className="block text-wa-preview font-medium text-wa-text-primary"
                  >
                    {dict.profileForm.wechatLabel}
                  </label>
                  <input
                    id="profile-wechat"
                    type="text"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-3.5 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-locale"
                  className="block text-wa-preview font-medium text-wa-text-primary"
                >
                  {dict.profileForm.languageLabel}
                </label>
                <select
                  id="profile-locale"
                  value={preferredLocale}
                  onChange={(e) => setPreferredLocale(e.target.value as Locale)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                >
                  {SUPPORTED_LOCALES.map((loc) => (
                    <option key={loc} value={loc}>
                      {dict.profileForm.localeNames[loc]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action non-commerce : vert primaire #008069 (bg-wa-header) */}
              <button
                type="submit"
                disabled={isSaving}
                className="flex min-h-[44px] w-full items-center justify-center rounded-wa-bubble bg-wa-header px-6 py-2.5 text-wa-preview font-semibold text-white shadow-wa-bubble transition-opacity duration-fast hover:opacity-95 disabled:opacity-60"
              >
                {isSaving
                  ? dict.profileForm.savingButton
                  : dict.profileForm.saveButton}
              </button>
            </form>
          </div>
        </div>

        {/* Colonne Droite : Gestionnaire d'adresses de livraison en Chine */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="wa-text-title text-wa-text-primary">
                  {dict.addresses.sectionTitle}
                </h2>
              </div>

              {!isAddressFormOpen && (
                <button
                  type="button"
                  onClick={openNewAddressForm}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-wa-accent px-4 py-2 text-wa-preview font-semibold text-white shadow-wa-bubble hover:opacity-95"
                >
                  {dict.addresses.addNewButton}
                </button>
              )}
            </div>

            {/* Formulaire d'ajout / édition d'adresse en Chine */}
            {isAddressFormOpen && (
              <form
                onSubmit={(e) => void handleSaveAddress(e)}
                className="mt-5 rounded-xl border border-wa-border bg-wa-composer p-5"
              >
                <h3 className="text-wa-contact font-medium text-wa-text-primary">
                  {editingAddressId
                    ? dict.addresses.form.editTitle
                    : dict.addresses.form.addTitle}
                </h3>

                {addressError && (
                  <div
                    role="alert"
                    className="mt-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-wa-meta font-semibold text-red-700"
                  >
                    {addressError}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="addr-label"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.labelField} *
                    </label>
                    <input
                      id="addr-label"
                      type="text"
                      required
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="addr-recipient"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.recipientField} *
                    </label>
                    <input
                      id="addr-recipient"
                      type="text"
                      required
                      value={addrRecipient}
                      onChange={(e) => setAddrRecipient(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="addr-phone"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.phoneField} *
                    </label>
                    <input
                      id="addr-phone"
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="addr-postal"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.postalCodeField}
                    </label>
                    <input
                      id="addr-postal"
                      type="text"
                      value={addrPostalCode}
                      onChange={(e) => setAddrPostalCode(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="addr-province"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.provinceField} *
                    </label>
                    <input
                      id="addr-province"
                      type="text"
                      required
                      value={addrProvince}
                      onChange={(e) => setAddrProvince(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="addr-city"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.cityField} *
                    </label>
                    <input
                      id="addr-city"
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="addr-district"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.districtField} *
                    </label>
                    <input
                      id="addr-district"
                      type="text"
                      required
                      value={addrDistrict}
                      onChange={(e) => setAddrDistrict(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="addr-street"
                      className="block text-wa-meta font-medium text-wa-text-primary"
                    >
                      {dict.addresses.form.streetField} *
                    </label>
                    <input
                      id="addr-street"
                      type="text"
                      required
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-wa-border bg-wa-panel px-3 py-2 text-wa-preview text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                    />
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-wa-preview font-medium text-wa-text-primary">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-wa-border text-wa-accent focus:ring-wa-accent"
                  />
                  {dict.addresses.setDefaultLabel}
                </label>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddressFormOpen(false)}
                    className="min-h-[40px] rounded-full border border-wa-border bg-wa-panel px-4 py-2 text-wa-preview font-medium text-wa-text-primary hover:bg-wa-composer"
                  >
                    {dict.addresses.form.cancelButton}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="min-h-[40px] rounded-full bg-wa-header px-5 py-2 text-wa-preview font-semibold text-white shadow-wa-bubble hover:opacity-95 disabled:opacity-60"
                  >
                    {dict.addresses.form.saveAddressButton}
                  </button>
                </div>
              </form>
            )}

            {/* Liste des adresses en Chine */}
            {user.addresses.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-wa-border p-6 text-center text-wa-preview text-wa-text-secondary">
                {dict.addresses.emptyMessage}
              </p>
            ) : (
              <div className="mt-5 divide-y divide-wa-border">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-wa-contact font-medium text-wa-text-primary">
                          📍 {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-wa-accent px-2.5 py-0.5 text-wa-meta font-semibold text-white">
                            {dict.addresses.defaultBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => void handleSetDefaultAddress(addr)}
                            className="rounded-full border border-wa-border bg-wa-composer px-3 py-1 text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent hover:bg-wa-border"
                          >
                            ★ {dict.addresses.defaultBadge}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditAddressForm(addr)}
                          className="rounded-full border border-wa-border bg-wa-composer px-3 py-1 text-wa-meta font-semibold text-wa-text-primary hover:bg-wa-border"
                        >
                          {dict.addresses.editButton}
                        </button>
                        {user.addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => void deleteAddress(addr.id)}
                            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-wa-meta font-semibold text-red-700 hover:bg-red-100"
                          >
                            {dict.addresses.deleteButton}
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-1.5 text-wa-preview font-medium text-wa-text-primary">
                      {addr.recipientName} • {addr.phone}
                    </p>
                    <p className="mt-0.5 text-wa-preview text-wa-text-secondary">
                      {addr.streetAddress}, {addr.district}, {addr.city},{' '}
                      {addr.province}
                      {addr.postalCode ? ` (${addr.postalCode})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
