/**
 * Test setup file for Vitest
 * Configures testing library and global mocks
 */
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
vi.stubEnv('VITE_FIREBASE_API_KEY', 'mock_firebase_api_key')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'mock-project.firebaseapp.com')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'mock-project')
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'mock-project.appspot.com')
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abcdef')

// Mock Firebase Auth
vi.mock('../config/firebase', () => ({
  auth: {},
  default: {},
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test_user_id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
    },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
  useAuthStore: {
    getState: () => ({ token: 'mock_token_12345', setToken: vi.fn() }),
  },
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: 'mock_token_12345', setToken: vi.fn() }),
  },
}))

// React Router is not mocked globally so that integration tests can use
// MemoryRouter/BrowserRouter and get real useParams/useNavigate from context.

