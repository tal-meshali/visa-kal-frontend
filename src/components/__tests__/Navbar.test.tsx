import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../../test/utils";
import { Navbar } from "../Navbar";
import { getCurrentUser } from "../../services/authService";

vi.mock("../../services/authService");

describe("Navbar", () => {
  const defaultProps = {
    theme: "light" as const,
    onThemeToggle: vi.fn(),
    onAccessibleClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "user@test.com",
      name: "Test User",
      created_at: new Date().toISOString(),
    });
  });

  it("renders logo link to home", () => {
    render(<Navbar {...defaultProps} />);
    const logo = screen.getByRole("link", { name: /Visa-Kal/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders nav links for home, countries, about", () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/#home");
    expect(screen.getByRole("link", { name: "Countries" })).toHaveAttribute("href", "/#countries");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/#about");
  });

  it("calls onThemeToggle when theme button is clicked", async () => {
    const user = userEvent.setup();
    const onThemeToggle = vi.fn();
    render(<Navbar {...defaultProps} onThemeToggle={onThemeToggle} />);
    const themeButton = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(themeButton);
    expect(onThemeToggle).toHaveBeenCalledTimes(1);
  });

  it("renders language switch with English and Hebrew options", () => {
    render(<Navbar {...defaultProps} />);
    const englishButtons = screen.getAllByRole("button", { name: /english/i });
    const hebrewButtons = screen.getAllByRole("button", { name: /עברית/i });
    expect(englishButtons.length).toBeGreaterThanOrEqual(1);
    expect(hebrewButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onAccessibleClick when accessible mode button is clicked", async () => {
    const user = userEvent.setup();
    const onAccessibleClick = vi.fn();
    render(<Navbar {...defaultProps} onAccessibleClick={onAccessibleClick} />);
    const accessibleButton = screen.getByRole("button", {
      name: /show site as accessible/i,
    });
    await user.click(accessibleButton);
    expect(onAccessibleClick).toHaveBeenCalledTimes(1);
  });

  it("applies accessible-toggle-on class when contrastMode is high", () => {
    const { container } = render(
      <Navbar {...defaultProps} contrastMode="high" />
    );
    const btn = container.querySelector(".accessible-toggle.accessible-toggle-on");
    expect(btn).toBeInTheDocument();
  });

  it("shows Export Agent URL link when user role is agent", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "agent-1",
      email: "agent@test.com",
      name: "Agent",
      created_at: new Date().toISOString(),
      role: "agent",
    });
    render(<Navbar {...defaultProps} />);
    await screen.findByRole("button", { name: /export agent url/i });
  });

  it("shows admin pricing link when user role is admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      created_at: new Date().toISOString(),
      role: "admin",
    });
    render(<Navbar {...defaultProps} />);
    const adminLink = await screen.findByRole("link", { name: /manage pricing/i });
    expect(adminLink).toHaveAttribute("href", "/admin/pricing");
  });

  it("shows agent URL copied modal after export and copies to clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "agent-1",
      email: "agent@test.com",
      name: "Agent",
      created_at: new Date().toISOString(),
      role: "agent",
    });
    render(<Navbar {...defaultProps} />);
    const exportBtn = await screen.findByRole("button", { name: /export agent url/i });
    await user.click(exportBtn);
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("agent=agent-1"));
    expect(screen.getByText(/agent url copied/i)).toBeInTheDocument();
  });
});
