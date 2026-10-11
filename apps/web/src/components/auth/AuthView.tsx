'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { SUPPORTED_LOCALES, type Locale } from '@attieke-chat/shared';
import type { ProfileDictionary } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';

interface AuthViewProps {
  locale: Locale;
  dict: ProfileDictionary;
}

const LoginFormSchema = z.object({
  phoneOrEmail: z.string().trim().min(4),
  password: z.string().optional(),
});

const RegisterFormSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().email().optional().or(z.literal('')),
  wechatId: z.string().optional(),
  preferredLocale: z.enum(['zh', 'fr', 'en']),
});

export function AuthView({
  locale,
  dict,
}: AuthViewProps): React.JSX.Element {
  const router = useRouter();
  const { login, register, isSaving } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>('+86 138 0013 8000');
  const [password, setPassword] = useState<string>('demo1234');

  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('+86 ');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regWechat, setRegWechat] = useState<string>('');
  const [regLocale, setRegLocale] = useState<Locale>(locale);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);
    const parsed = LoginFormSchema.safeParse({ phoneOrEmail, password });
    if (!parsed.success) {
      setFormError(dict.auth.validationError);
      return;
    }

    try {
      await login(parsed.data);
      router.push(`/${locale}/profile`);
    } catch {
      setFormError(dict.auth.validationError);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);
    const parsed = RegisterFormSchema.safeParse({
      name: regName,
      phone: regPhone,
      email: regEmail,
      wechatId: regWechat,
      preferredLocale: regLocale,
    });

    if (!parsed.success) {
      setFormError(dict.auth.validationError);
      return;
    }

    try {
      await register(parsed.data);
      router.push(`/${regLocale}/profile`);
    } catch {
      setFormError(dict.auth.validationError);
    }
  };

  const handleDemoQuickLogin = async (): Promise<void> => {
    setFormError(null);
    await login({ phoneOrEmail: '+86 138 0013 8000' });
    router.push(`/${locale}/profile`);
  };

  return (
    <section className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <div className="overflow-hidden rounded-2xl border border-wa-border bg-wa-panel p-6 shadow-wa-panel sm:p-8">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-wa-accent/15 px-3.5 py-1 text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent">
            {dict.auth.badge}
          </span>
        </div>

        {/* Onglets Connexion / Inscription */}
        <div className="mt-5 grid grid-cols-2 rounded-full bg-wa-composer p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
            }}
            className={`min-h-[42px] rounded-full text-wa-preview font-semibold transition-colors duration-fast ${
              mode === 'login'
                ? 'bg-wa-accent text-white shadow-wa-bubble'
                : 'text-wa-text-secondary hover:text-wa-text-primary'
            }`}
          >
            {dict.auth.loginTab}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
            }}
            className={`min-h-[42px] rounded-full text-wa-preview font-semibold transition-colors duration-fast ${
              mode === 'register'
                ? 'bg-wa-accent text-white shadow-wa-bubble'
                : 'text-wa-text-secondary hover:text-wa-text-primary'
            }`}
          >
            {dict.auth.registerTab}
          </button>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-wa-meta font-semibold text-red-700"
          >
            {formError}
          </div>
        )}

        {/* Formulaire de Connexion */}
        {mode === 'login' ? (
          <form
            onSubmit={(e) => void handleLoginSubmit(e)}
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="auth-phone-email"
                className="block text-wa-preview font-medium text-wa-text-primary"
              >
                {dict.auth.phoneOrEmailLabel}
              </label>
              <input
                id="auth-phone-email"
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder={dict.auth.phoneOrEmailPlaceholder}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-wa-preview font-medium text-wa-text-primary"
              >
                {dict.auth.passwordLabel}
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={dict.auth.passwordPlaceholder}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex min-h-[44px] w-full items-center justify-center rounded-wa-bubble bg-wa-header px-6 py-2.5 text-wa-preview font-semibold text-white shadow-wa-bubble hover:opacity-95 disabled:opacity-60"
            >
              {dict.auth.loginSubmit}
            </button>
          </form>
        ) : (
          /* Formulaire d'Inscription */
          <form
            onSubmit={(e) => void handleRegisterSubmit(e)}
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="reg-name"
                className="block text-wa-preview font-medium text-wa-text-primary"
              >
                {dict.profileForm.nameLabel} *
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
              />
            </div>

            <div>
              <label
                htmlFor="reg-phone"
                className="block text-wa-preview font-medium text-wa-text-primary"
              >
                {dict.profileForm.phoneLabel} *
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-wa-preview font-medium text-wa-text-primary"
                >
                  {dict.profileForm.emailLabel}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-wechat"
                  className="block text-wa-preview font-medium text-wa-text-primary"
                >
                  {dict.profileForm.wechatLabel}
                </label>
                <input
                  id="reg-wechat"
                  type="text"
                  value={regWechat}
                  onChange={(e) => setRegWechat(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary focus:outline-none focus:ring-2 focus:ring-wa-accent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-locale"
                className="block text-wa-preview font-medium text-wa-text-primary"
              >
                {dict.profileForm.languageLabel}
              </label>
              <select
                id="reg-locale"
                value={regLocale}
                onChange={(e) => setRegLocale(e.target.value as Locale)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-wa-border bg-wa-composer px-4 py-2 text-wa-msg text-wa-text-primary"
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option key={loc} value={loc}>
                    {dict.profileForm.localeNames[loc]}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex min-h-[44px] w-full items-center justify-center rounded-wa-bubble bg-wa-header px-6 py-2.5 text-wa-preview font-semibold text-white shadow-wa-bubble hover:opacity-95 disabled:opacity-60"
            >
              {dict.auth.registerSubmit}
            </button>
          </form>
        )}

        {/* Connexion rapide en 1 clic avec le compte démo */}
        <div className="mt-6 rounded-xl border border-wa-border bg-wa-composer p-4 text-center">
          <p className="text-wa-preview font-semibold text-wa-dark-green dark:text-wa-accent">
            ⚡ {dict.auth.demoAccountTitle}
          </p>
          <p className="mt-0.5 text-wa-meta text-wa-text-secondary">
            {dict.auth.demoAccountSubtitle}
          </p>
          <button
            type="button"
            onClick={() => void handleDemoQuickLogin()}
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-wa-accent px-4 py-2 text-wa-preview font-semibold text-white hover:opacity-95"
          >
            {dict.auth.useDemoAccountButton}
          </button>
        </div>
      </div>
    </section>
  );
}
