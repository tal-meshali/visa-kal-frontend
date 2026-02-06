import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { LanguageProvider } from "../../contexts/LanguageProvider";
import { TokenReadyProvider } from "../../contexts/TokenReadyContext";
import { FirebaseTokenSync } from "../../components/FirebaseTokenSync";
import ApplicationForm from "../ApplicationForm";
import { apiService } from "../../services/apiService";
import { AuthContext } from "../../contexts/AuthContext";
import { hasCookieRefused } from "../../constants/cookieConsent";
import type { FormSchema } from "../../types/formTypes";

vi.unmock("../../contexts/AuthContext");
vi.mock("../../constants/cookieConsent");

const TEST_TOKEN = "test-bearer-token-xyz";

const mockFormSchema: FormSchema = {
  country_id: "morocco",
  country_name: { en: "Morocco", he: "מרוקו" },
  fields: [],
  submit_button_text: { en: "Submit", he: "שלח" },
};

const mockUser = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: null,
  emailVerified: true,
};

const authValueNoUser = {
  user: null,
  loading: false,
  getIdToken: vi.fn().mockResolvedValue(null),
  signIn: vi.fn(),
  signOut: vi.fn(),
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  verifyEmail: vi.fn(),
  refreshUser: vi.fn(),
};

function TestAuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<typeof mockUser | null>(null);
  const value = {
    ...authValueNoUser,
    user,
    getIdToken: vi.fn().mockResolvedValue(user ? TEST_TOKEN : null),
  };
  return (
    <AuthContext.Provider value={value}>
      <button
        type="button"
        data-testid="simulate-login"
        onClick={() => setUser(mockUser)}
      >
        Simulate login
      </button>
      {children}
    </AuthContext.Provider>
  );
}

function renderFormPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <TestAuthWrapper>
      <TokenReadyProvider>
        <QueryClientProvider client={queryClient}>
          <FirebaseTokenSync />
          <LanguageProvider defaultLanguage="en">
            <MemoryRouter initialEntries={["/apply/morocco"]}>
              <Routes>
                <Route path="/apply/:countryId" element={<ApplicationForm />} />
              </Routes>
            </MemoryRouter>
          </LanguageProvider>
        </QueryClientProvider>
      </TokenReadyProvider>
    </TestAuthWrapper>
  );
}

describe("ApplicationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(hasCookieRefused).mockReturnValue(false);
  });

  it("shows login prompt when not signed in, then backend requests receive token after simulated login", async () => {
    let capturedConfig: { headers?: { Authorization?: string } } = {};
    apiService.defaults.adapter = (config) => {
      capturedConfig = config;
      return Promise.resolve({
        data: config.url?.includes("/api/form-schema/") ? mockFormSchema : {},
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      });
    };

    renderFormPage();

    expect(
      screen.getByRole("heading", { name: /sign in required/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please sign in to access the application form/i)
    ).toBeInTheDocument();

    const simulateLoginBtn = screen.getByTestId("simulate-login");
    await userEvent.click(simulateLoginBtn);

    await waitFor(
      () => {
        expect(capturedConfig.headers?.Authorization).toBe(
          `Bearer ${TEST_TOKEN}`
        );
      },
      { timeout: 3000 }
    );
  });
});
