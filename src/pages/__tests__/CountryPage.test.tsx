import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../../contexts/LanguageProvider";
import CountryPage from "../CountryPage";
import { fetchCountries } from "../../services/countryService";
import { getCountryPricing } from "../../services/pricingService";

vi.mock("../../services/countryService");
vi.mock("../../services/pricingService");

const mockCountry = {
  id: "morocco",
  name: { en: "Morocco", he: "מרוקו" },
  flag_svg_link: "/flags/morocco.svg",
  enabled: true,
};

const mockCountriesResponse = {
  available: [mockCountry],
  coming_soon: [],
};

const mockPricingPlans = [
  {
    id: "plan-1",
    country_id: "morocco",
    price_usd: 50,
    price_ils: 180,
    name_en: "Standard",
    name_he: "סטנדרט",
    description_en: "Standard visa processing",
    description_he: "עיבוד ויזה סטנדרטי",
  },
];

function renderCountryPage(initialEntry = "/country/morocco") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider defaultLanguage="en">
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/country/:countryId" element={<CountryPage />} />
            <Route path="/" element={<div data-testid="home">Home</div>} />
            <Route path="/apply/:countryId" element={<div data-testid="apply-page">Apply</div>} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

describe("CountryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchCountries).mockResolvedValue(mockCountriesResponse);
    vi.mocked(getCountryPricing).mockResolvedValue(mockPricingPlans);
  });

  it("shows loading state initially", () => {
    vi.mocked(fetchCountries).mockImplementation(
      () => new Promise(() => {})
    );
    vi.mocked(getCountryPricing).mockImplementation(
      () => new Promise(() => {})
    );
    renderCountryPage();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders country name and sections when data is loaded", async () => {
    renderCountryPage();
    expect(await screen.findByRole("heading", { name: "Morocco", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Visa Process")).toBeInTheDocument();
    expect(screen.getByText("Available Pricing Programs")).toBeInTheDocument();
  });

  it("renders pricing plans with name and price", async () => {
    renderCountryPage();
    await screen.findByRole("heading", { name: "Morocco", level: 1 });
    expect(screen.getByText(/Standard - ₪180/)).toBeInTheDocument();
    expect(screen.getByText("Standard visa processing")).toBeInTheDocument();
  });

  it("shows no plans message when pricing returns empty", async () => {
    vi.mocked(getCountryPricing).mockResolvedValue([]);
    renderCountryPage();
    await screen.findByRole("heading", { name: "Morocco", level: 1 });
    expect(screen.getByText("No pricing plans available for this country")).toBeInTheDocument();
  });

  it("navigates to apply page when Start Application is clicked", async () => {
    const user = userEvent.setup();
    renderCountryPage();
    await screen.findByRole("heading", { name: "Morocco", level: 1 });
    const startBtn = screen.getByRole("button", { name: /start application/i });
    await user.click(startBtn);
    expect(screen.getByTestId("apply-page")).toBeInTheDocument();
  });

  it("redirects to home when country is not found", async () => {
    vi.mocked(fetchCountries).mockResolvedValue({ available: [], coming_soon: [] });
    renderCountryPage("/country/nonexistent");
    expect(await screen.findByTestId("home")).toBeInTheDocument();
  });

  it("displays error alert when pricing fetch fails", async () => {
    vi.mocked(getCountryPricing).mockRejectedValue(new Error("Network error"));
    renderCountryPage();
    await screen.findByRole("heading", { name: "Morocco", level: 1 });
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});
