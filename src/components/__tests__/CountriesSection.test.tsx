import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/utils";
import { CountriesSection } from "../CountriesSection";

const mockTranslations = {
  countries: {
    title: "Available Destinations",
    subtitle: "Select your destination",
    upcoming: "Coming Soon",
    select: "Select Country",
  },
};

const availableCountries = [
  {
    id: "morocco",
    name: { en: "Morocco", he: "מרוקו" },
    flag_svg_link: "/flags/ma.svg",
    enabled: true,
  },
  {
    id: "tanzania",
    name: { en: "Tanzania", he: "טנזניה" },
    flag_svg_link: "/flags/tz.svg",
    enabled: true,
  },
];

const upcomingCountries = [
  {
    id: "sri-lanka",
    name: { en: "Sri Lanka", he: "סרי לנקה" },
    flag_svg_link: "/flags/lk.svg",
    enabled: false,
  },
];

describe("CountriesSection", () => {
  it("renders section title and subtitle from translations", () => {
    render(
      <CountriesSection
        language="en"
        translations={mockTranslations}
        availableCountries={availableCountries}
        upcomingCountries={[]}
      />
    );
    expect(screen.getByRole("heading", { name: "Available Destinations" })).toBeInTheDocument();
    expect(screen.getByText("Select your destination")).toBeInTheDocument();
  });

  it("renders available countries with correct names and links", () => {
    render(
      <CountriesSection
        language="en"
        translations={mockTranslations}
        availableCountries={availableCountries}
        upcomingCountries={[]}
      />
    );
    const moroccoLink = screen.getByRole("link", { name: /morocco/i });
    expect(moroccoLink).toHaveAttribute("href", "/country/morocco");
    expect(screen.getByRole("link", { name: /tanzania/i })).toHaveAttribute("href", "/country/tanzania");
    expect(screen.getAllByText("Select Country").length).toBe(2);
  });

  it("renders country names in Hebrew when language is he", () => {
    render(
      <CountriesSection
        language="he"
        translations={mockTranslations}
        availableCountries={availableCountries}
        upcomingCountries={[]}
      />
    );
    expect(screen.getByRole("link", { name: /מרוקו/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /טנזניה/ })).toBeInTheDocument();
  });

  it("renders upcoming section with coming soon badge when upcoming countries exist", () => {
    render(
      <CountriesSection
        language="en"
        translations={mockTranslations}
        availableCountries={availableCountries}
        upcomingCountries={upcomingCountries}
      />
    );
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    const sriLankaLink = screen.getByRole("link", { name: /sri lanka/i });
    expect(sriLankaLink).toHaveAttribute("href", "/country/sri-lanka");
    expect(sriLankaLink).toHaveClass("country-card", "upcoming");
  });

  it("does not render upcoming block when upcomingCountries is empty", () => {
    render(
      <CountriesSection
        language="en"
        translations={mockTranslations}
        availableCountries={availableCountries}
        upcomingCountries={[]}
      />
    );
    expect(screen.queryByText("Coming Soon")).not.toBeInTheDocument();
  });
});
