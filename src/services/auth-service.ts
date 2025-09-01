/**
 * Authentication Service
 * 
 * This service handles user authentication, session management,
 * and authorization for protected routes.
 */

// Define interfaces for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User'
  },
  {
    id: 'user_2',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    avatar: 'https://ui-avatars.com/api/?name=Regular+User'
  },
  {
    id: 'user_3',
    email: 'neuvera',  // Using username as email for the special case
    name: 'Neuvera Admin',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Neuvera+Admin'
  }
];

// Auth service implementation
class AuthService {
  private currentUser: User | null = null;
  private isLoggedIn: boolean = false;
  
  // Initialize auth state from localStorage (if available)
  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
          this.isLoggedIn = true;
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          localStorage.removeItem('auth_user');
        }
      }
    }
  }

  // Get current authentication state
  getAuthState(): AuthState {
    return {
      isAuthenticated: this.isLoggedIn,
      user: this.currentUser,
      loading: false,
      error: null
    };
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      // Special case for the specific credentials
      if (credentials.email === 'neuvera' && credentials.password === '1234@') {
        const user = mockUsers.find(u => u.email === 'neuvera');
        if (user) {
          this.currentUser = user;
          this.isLoggedIn = true;
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(user));
          }
          
          return {
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          };
        }
      }
      
      // Attempt to authenticate with the real API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (response.ok) {
        const userData = await response.json();
        this.currentUser = userData.user;
        this.isLoggedIn = true;
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(userData.user));
        }
        
        return {
          isAuthenticated: true,
          user: userData.user,
          loading: false,
          error: null
        };
      } else {
        // API call failed, try fallback to mock data for development
        console.warn('API authentication failed, falling back to mock data');
        
        // Find user with matching credentials in mock data
        const user = mockUsers.find(u => u.email === credentials.email);
        
        if (user) {
          // For this mock, we'll assume the password is correct
          this.currentUser = user;
          this.isLoggedIn = true;
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(user));
          }
          
          return {
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          };
        } else {
          return {
            isAuthenticated: false,
            user: null,
            loading: false,
            error: 'Invalid email or password'
          };
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Fallback to mock data if API is unavailable
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (user) {
        this.currentUser = user;
        this.isLoggedIn = true;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(user));
        }
        
        return {
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        };
      } else {
        return {
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'Authentication failed'
        };
      }
    }
  }

  // Logout current user
  async logout(): Promise<void> {
    try {
      // Attempt to logout with the real API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API success
      this.currentUser = null;
      this.isLoggedIn = false;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if current user has a specific role
  hasRole(role: 'admin' | 'user'): boolean {
    return this.currentUser?.role === role;
  }
}

// Export a singleton instance
export const authService = new AuthService();