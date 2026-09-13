import { afterEach, describe, expect, it, vi } from 'vitest';
import { printPolicy } from './print';

describe('printPolicy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls window.print exactly once', () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    printPolicy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
