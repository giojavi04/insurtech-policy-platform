import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { afterEach } from 'vitest';

// jsdom ships a `window.crypto` stub without `.subtle` (confirmed: jsdom 25
// provides getRandomValues but not SubtleCrypto). `lib/policy/digest.ts` uses
// `crypto.subtle.digest` for real, so tests need Node's webcrypto patched in
// — this is a test-environment gap only, every real browser has it.
if (typeof globalThis.crypto !== 'undefined' && !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: webcrypto.subtle,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});
