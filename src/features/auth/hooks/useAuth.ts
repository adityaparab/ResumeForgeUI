// Placeholder hook - will be implemented in Issue #10
export function useAuth() {
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null as null | { email: string },
    login: async (_email: string, _password: string) => {},
    register: async (_email: string, _password: string) => {},
    logout: () => {},
  }
}
