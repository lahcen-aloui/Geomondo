import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectKeys(value, prefix = '') {
  if (!isRecord(value)) return [prefix];

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return collectKeys(nestedValue, nextPrefix);
  });
}

export function validateLocaleMessages(messagesByLocale) {
  const entries = Object.entries(messagesByLocale);
  const allKeys = new Set(entries.flatMap(([, messages]) => collectKeys(messages)));

  return entries.flatMap(([locale, messages]) => {
    const keys = new Set(collectKeys(messages));
    return [...allKeys]
      .filter(key => !keys.has(key))
      .sort()
      .map(key => ({ locale, key }));
  });
}

function readLocale(locale) {
  const filePath = join(projectRoot, 'messages', `${locale}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function run() {
  const missing = validateLocaleMessages({
    en: readLocale('en'),
    it: readLocale('it'),
  });

  if (missing.length === 0) {
    console.log('i18n check passed');
    return;
  }

  console.error('Missing i18n keys:');
  for (const item of missing) {
    console.error(`- ${item.locale}: ${item.key}`);
  }
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
