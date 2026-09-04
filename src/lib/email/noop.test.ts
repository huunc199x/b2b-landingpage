import { describe, it, expect } from 'vitest';
import { NoopEmailAdapter } from './noop';

describe('NoopEmailAdapter', () => {
  it('không gửi thật nhưng trả ok:true (UAT/dev)', async () => {
    const adapter = new NoopEmailAdapter();
    const res = await adapter.send({
      to: 'sale@mytel.example',
      from: 'no-reply@mytel.example',
      subject: 'Lead mới',
      text: 'nội dung',
    });
    expect(res.ok).toBe(true);
    expect(adapter.name).toBe('noop');
  });
});
