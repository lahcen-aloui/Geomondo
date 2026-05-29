import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is the [locale] segment from the URL
  let locale = await requestLocale;

  // Fall back to defaultLocale if locale is undefined or unsupported
  if (!locale || !routing.locales.includes(locale as 'it' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
