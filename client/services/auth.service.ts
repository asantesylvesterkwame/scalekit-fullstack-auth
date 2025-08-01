import { API_URL } from "@/api";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  givenName?: string;
  organization?: string;
  role?: string;
  avatar?: string;
}

interface AuthResponse {
  authenticated: boolean;
  user?: User;
  message?: string;
}

class AuthService {
  // Check if user is authenticated - handles both authenticated and non-authenticated states
  static async checkAuth(): Promise<AuthResponse> {
    try {
      const response = await API_URL.get("/auth/me");

      if (response.data && response.data.authenticated) {
        return {
          authenticated: true,
          user: response.data.user,
        };
      } else {
        return { authenticated: false };
      }
    } catch (error: any) {
      // Handle 401 as "not authenticated" rather than an error
      if (error.response?.status === 401) {
        console.log(
          "User not authenticated (401) - this is expected for new visitors"
        );
        return {
          authenticated: false,
          message: "Not authenticated",
        };
      }

      // For other errors, log them but still return not authenticated
      console.error("Auth check failed with unexpected error:", error);
      return {
        authenticated: false,
        message: "Authentication check failed",
      };
    }
  }

  // Initiate authentication flow
  static authenticate(): void {
    console.log("Initiating authentication with ScaleKit...");
    window.location.href = `${API_URL.defaults.baseURL}/auth`;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      console.log("Initiating logout...");
      // Call logout endpoint - server will handle ScaleKit logout and cleanup
      await API_URL.get("/auth/logout");
    } catch (error) {
      console.error(
        "Logout API call failed, but continuing with local cleanup:",
        error
      );
    } finally {
      // Always redirect to home after logout attempt
      window.location.href = "/";
    }
  }

  // Get current user (alias for checkAuth)
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.checkAuth();
      return response.authenticated ? response.user || null : null;
    } catch (error) {
      console.error("Get current user failed:", error);
      return null;
    }
  }

  static async authCallback(
    code: string | null,
    error: string | null,
    error_description: string | null
  ) {
    try {
      const response = await API_URL.post(`/auth/callback`, {
        code,
        error,
        error_description,
      });
      return response.data;
    } catch (error) {
      console.error("Server health check failed:", error);
      return false;
    }
  }
}

export default AuthService;
export type { User, AuthResponse };
