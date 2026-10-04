import { tariffService, clearAuthToken } from "../axios";
import type { InternalAxiosRequestConfig } from "axios";
const token = (expires: number) =>
  `e30.${btoa(JSON.stringify({ exp: expires }))}.signature`;
const originalFetch = global.fetch;
beforeEach(() => clearAuthToken());
afterEach(() => {
  global.fetch = originalFetch;
});
const adapter = async (config: InternalAxiosRequestConfig) => ({
  data: config.headers.Authorization,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});
test("parallel requests share token acquisition", async () => {
  const jwt = token(Date.now() / 1000 + 3600);
  global.fetch = jest.fn(
    async () => ({ ok: true, json: async () => ({ token: jwt }) }) as Response,
  );
  const responses = await Promise.all([
    tariffService.get("/all", { adapter }),
    tariffService.get("/all", { adapter }),
  ]);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(responses.map((r) => r.data)).toEqual([
    `Bearer ${jwt}`,
    `Bearer ${jwt}`,
  ]);
});
test("a token that expires is refreshed", async () => {
  const fresh = token(Date.now() / 1000 + 3600);
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: token(1) }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ token: fresh }) });
  await tariffService.get("/all", { adapter });
  expect((await tariffService.get("/all", { adapter })).data).toBe(
    `Bearer ${fresh}`,
  );
  expect(global.fetch).toHaveBeenCalledTimes(2);
});
test("clearing credentials rejects stale in-flight token work", async () => {
  let resolve!: (value: Response) => void;
  global.fetch = jest.fn(
    () =>
      new Promise<Response>((r) => {
        resolve = r;
      }),
  );
  const request = tariffService.get("/all", { adapter });
  await Promise.resolve();
  await Promise.resolve();
  clearAuthToken();
  resolve({
    ok: true,
    json: async () => ({ token: token(Date.now() / 1000 + 3600) }),
  } as Response);
  expect((await request).data).toBeUndefined();
});
