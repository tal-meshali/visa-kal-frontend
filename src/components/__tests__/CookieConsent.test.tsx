import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "../../test/utils";
import { CookieConsent } from "../CookieConsent";

const mockSetAccepted = vi.fn();
const mockSetRefused = vi.fn();

const mockUseCookieConsentStore = vi.fn();

vi.mock("../../stores/cookieConsentStore", () => ({
  useCookieConsentStore: (selector?: (state: unknown) => unknown) => {
    const state = mockUseCookieConsentStore();
    if (typeof selector === "function") {
      return selector(state);
    }
    return state;
  },
  COOKIE_CONSENT_KEY: "visa-kal-cookie-consent",
}));

describe("CookieConsent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCookieConsentStore.mockReturnValue({
      status: null,
      hasChoiceMade: () => false,
      hasConsent: () => false,
      hasRefused: () => false,
      setAccepted: mockSetAccepted,
      setRefused: mockSetRefused,
    });
  });

  it("renders dialog when user has not made cookie choice", () => {
    render(<CookieConsent />);
    expect(
      screen.getByRole("dialog", { name: /data & privacy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we store information locally/i),
    ).toBeInTheDocument();
  });

  it("does not render when user has already made cookie choice", () => {
    mockUseCookieConsentStore.mockReturnValue({
      status: "accepted",
      hasChoiceMade: () => true,
      hasConsent: () => true,
      hasRefused: () => false,
      setAccepted: mockSetAccepted,
      setRefused: mockSetRefused,
    });
    render(<CookieConsent />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls setAccepted and hides dialog when Accept is clicked", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    const acceptButton = screen.getByRole("button", { name: /accept/i });
    await user.click(acceptButton);
    expect(mockSetAccepted).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls setRefused and hides dialog when Decline is clicked", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);
    const refuseButton = screen.getByRole("button", { name: /decline/i });
    await user.click(refuseButton);
    expect(mockSetRefused).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders link to privacy policy", () => {
    render(<CookieConsent />);
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "/privacy-policy");
  });

  it("has accessible title for the dialog", () => {
    render(<CookieConsent />);
    expect(
      screen.getByRole("dialog", { name: /data & privacy/i }),
    ).toHaveAttribute("aria-labelledby", "cookie-consent-title");
  });
});
