import { describe, expect, test } from 'vitest';
import { validateLocaleMessages } from './check-i18n.mjs';

describe('validateLocaleMessages', () => {
  test('accepts locales with matching nested message keys', () => {
    const result = validateLocaleMessages({
      en: {
        nav: {
          play: 'Play',
        },
      },
      it: {
        nav: {
          play: 'Gioca',
        },
      },
    });

    expect(result).toEqual([]);
  });

  test('reports keys missing from a locale', () => {
    const result = validateLocaleMessages({
      en: {
        nav: {
          play: 'Play',
          leaderboard: 'Leaderboard',
        },
      },
      it: {
        nav: {
          play: 'Gioca',
        },
      },
    });

    expect(result).toEqual([
      {
        locale: 'it',
        key: 'nav.leaderboard',
      },
    ]);
  });
});
