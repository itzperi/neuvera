import { trackingDataService } from '../services/tracking-data-service';
import { authService } from '../services/auth-service';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Tracking Integration Tests', () => {
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });
  
  describe('TrackingDataService', () => {
    test('getTrackingStats should fetch from API and return data', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalEvents: 1000,
          totalPageViews: 500,
          uniqueUsers: 200,
          avgSessionDuration: 120
        })
      });
      
      const stats = await trackingDataService.getTrackingStats();
      
      // Verify API was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tracking/data?type=stats',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Verify returned data
      expect(stats).toEqual({
        totalEvents: 1000,
        totalPageViews: 500,
        uniqueUsers: 200,
        avgSessionDuration: 120
      });
    });
    
    test('getTrackingEvents should fetch from API with correct parameters', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 'event1', type: 'pageview', timestamp: new Date().toISOString() }
        ])
      });
      
      const events = await trackingDataService.getTrackingEvents({
        limit: 10,
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      });
      
      // Verify API was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tracking/data?type=events&limit=10&startDate=2023-01-01&endDate=2023-01-31',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Verify returned data
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event1');
    });
    
    test('should fall back to mock data if API fails', async () => {
      // Mock failed API response
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      const stats = await trackingDataService.getTrackingStats();
      
      // Verify API was called
      expect(global.fetch).toHaveBeenCalled();
      
      // Verify we got fallback mock data
      expect(stats).toBeDefined();
      expect(stats.totalEvents).toBeGreaterThan(0);
    });
  });
  
  describe('AuthService', () => {
    test('login should authenticate with API and return user data', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          user: {
            id: 'user_1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin'
          }
        })
      });
      
      const result = await authService.login({
        email: 'admin@example.com',
        password: 'password123'
      });
      
      // Verify API was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'admin@example.com',
            password: 'password123'
          })
        })
      );
      
      // Verify returned data
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('admin@example.com');
    });
    
    test('logout should call API and clear user data', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logout successful' })
      });
      
      await authService.logout();
      
      // Verify API was called
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include'
        })
      );
      
      // Verify user is logged out
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});