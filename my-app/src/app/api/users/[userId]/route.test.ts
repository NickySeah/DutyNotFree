/** @jest-environment node */
import { NextRequest } from "next/server";
import { GET } from "./route";
const mockExecute = jest.fn(async (..._args: unknown[]) => [
  [{ id: "u1", email: "owner@example.com" }],
]);
jest.mock("@/utils/auth", () => ({
  auth: {
    options: {
      database: { execute: (...args: unknown[]) => mockExecute(...args) },
    },
  },
}));
const context = { params: Promise.resolve({ userId: "u1" }) };
beforeEach(() => {
  process.env.INTERNAL_API_KEY = "test-service-credential";
  mockExecute.mockClear();
});
afterEach(() => {
  delete process.env.INTERNAL_API_KEY;
});
test("user email is protected from unauthenticated requests", async () => {
  expect(
    (await GET(new NextRequest("http://localhost/api/users/u1"), context))
      .status,
  ).toBe(401);
  expect(mockExecute).not.toHaveBeenCalled();
});
test("missing service configuration fails closed", async () => {
  delete process.env.INTERNAL_API_KEY;
  expect(
    (
      await GET(
        new NextRequest("http://localhost/api/users/u1", {
          headers: { "x-internal-api-key": "test-service-credential" },
        }),
        context,
      )
    ).status,
  ).toBe(401);
});
test("matching service credential returns the required user fields", async () => {
  const response = await GET(
    new NextRequest("http://localhost/api/users/u1", {
      headers: { "x-internal-api-key": "test-service-credential" },
    }),
    context,
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    userId: "u1",
    email: "owner@example.com",
  });
});
