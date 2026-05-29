import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Italian is default (no URL prefix), English has /en/ prefix
  locales: ['it', 'en'] as const,
  defaultLocale: 'it',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
