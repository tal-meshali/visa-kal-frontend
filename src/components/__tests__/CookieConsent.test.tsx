import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../../test/utils";
import { CookieConsent } from "../CookieConsent";
import * as cookieConsent from "../../constants/cookieConsent";

vi.mock("../../constants/cookieConsent");

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookieConsent.hasCookieChoiceMade).mockReturnValue(false);
  });

  it("renders dialog when user has not made cookie choice", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("dialog", { name: /cookie & privacy/i })).toBeInTheDocument();
    expect(screen.getByText(/we use cookies/i)).toBeInTheDocument();
  });

  it("does not render when user has already made cookie choice", () => {
    vi.mocked(cookieConsent.hasCookieChoiceMade).mockReturnValue(true);
    render(<CookieConsent />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls setCookieConsent and hides dialog when Accept is clicked", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    const acceptButton = screen.getByRole("button", { name: /accept/i });
    await user.click(acceptButton);
    expect(cookieConsent.setCookieConsent).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls setCookieRefused and hides dialog when Decline is clicked", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    const refuseButton = screen.getByRole("button", { name: /decline/i });
    await user.click(refuseButton);
    expect(cookieConsent.setCookieRefused).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders link to privacy policy", () => {
    render(<CookieConsent />);
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "/privacy-policy");
  });

  it("has accessible title for the dialog", () => {
    render(<CookieConsent />);
    expect(screen.getByRole("dialog", { name: /cookie & privacy/i })).toHaveAttribute(
      "aria-labelledby",
      "cookie-consent-title"
    );
  });
});
