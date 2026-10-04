import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import VerifyEmailPage from "../page";
import { sendVerificationEmail } from "@/lib/auth-client";
beforeEach(() => {
  window.history.replaceState(
    {},
    "",
    "/verify-your-email?email=test%40example.com",
  );
  jest.clearAllMocks();
});
test("an API error remains retryable and does not report delivery", async () => {
  jest
    .mocked(sendVerificationEmail)
    .mockResolvedValueOnce({
      error: { message: "Too many requests" },
    } as never);
  render(<VerifyEmailPage />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Resend Verification Email" }),
  );
  expect(await screen.findByText("Too many requests")).toBeInTheDocument();
  expect(
    screen.queryByText("A new verification link has been sent!"),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Resend Verification Email" }),
  ).toBeEnabled();
});
