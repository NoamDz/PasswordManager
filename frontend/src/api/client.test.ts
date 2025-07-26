import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Fresh import per test to reset internal authToken state
type ClientModule = typeof import('./client');

// Simple helper to create a fetch Response–like stub
function createResponse(body: unknown, init?: Partial<Response>): Response {
  return {
    ok: (init?.status ?? 200) >= 200 && (init?.status ?? 200) < 300,
    status: init?.status ?? 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe('typed API client', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules(); // ensure client re-evaluates

    fetchMock = vi.fn();
    // @ts-ignore
    global.fetch = fetchMock;
    // clear localStorage between tests
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('register() posts to /api/auth/register with correct payload', async () => {
    const user = { id: 'u1', email: 'test@example.com', created_at: 'now' };
    fetchMock.mockResolvedValue(createResponse(user));

    const client: ClientModule = await import('./client');

    const res = await client.register('test@example.com', 'secret');
    expect(res).toEqual(user);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/auth\/register$/);
    expect(options?.method).toBe('POST');
    expect(options?.body).toBe(JSON.stringify({ email: 'test@example.com', password: 'secret' }));
  });

  it('login() stores token and subsequent requests include Authorization header', async () => {
    const token = { access_token: 'jwt123' };
    const vault = { blob: 'AAA', version: 1, updated_at: 'now' };

    // first call (login) returns token, second call (getLatestVault) returns vault
    fetchMock
      .mockResolvedValueOnce(createResponse(token))
      .mockResolvedValueOnce(createResponse(vault));

    const client: ClientModule = await import('./client');

    const resToken = await client.login('me@example.com', 'pw');
    expect(resToken).toEqual(token);
    // token persisted in localStorage
    expect(localStorage.getItem('token')).toBe('jwt123');

    await client.getLatestVault();

    // Examine headers of second fetch call
    const [, options] = fetchMock.mock.calls[1] as [string, RequestInit];
    const headers = new Headers(options?.headers);
    expect(headers.get('Authorization')).toBe('Bearer jwt123');
  });

  it('getLatestVault returns null on 404', async () => {
    fetchMock.mockResolvedValue(
      createResponse({ detail: 'Not found' }, { status: 404 })
    );

    const client: ClientModule = await import('./client');
    const res = await client.getLatestVault();
    expect(res).toBeNull();
  });
}); 