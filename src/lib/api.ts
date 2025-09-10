import { User, UserFormData, ApiResponse, PaginatedUsersResponse } from './types';

/**
 * Real API service layer connecting to Express/Prisma backend
 * This class handles all HTTP requests to the backend API
 * and provides consistent error handling and response formatting
 */

// Base URL for all API endpoints
const API_BASE_URL = 'http://localhost:3001/api';

class UserProfileAPI {
  
  /**
   * Generic fetch wrapper with consistent error handling
   * @param url - The API endpoint URL
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns Promise<ApiResponse<T>> - Standardized API response
   */
  private async fetchWithErrorHandling<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Make HTTP request with default headers
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Parse JSON response
      const data = await response.json();

      // Handle HTTP error responses
      if (!response.ok) {
        return {
          data: {} as T,
          success: false,
          message: data.error || `HTTP error! status: ${response.status}`
        };
      }

      // Return successful response
      return {
        data,
        success: true,
        message: 'Operation completed successfully'
      };
    } catch (error) {
      // Handle network errors, JSON parsing errors, etc.
      console.error('API Error:', error);
      return {
        data: {} as T,
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  /**
   * Retrieves paginated users from the database
   * @param page - Page number (1-based, default: 1)
   * @param limit - Number of users per page (default: 20)
   * @param search - Optional search query for filtering
   * @returns Promise<ApiResponse<PaginatedUsersResponse>> - Paginated user data with metadata
   */
  async getAllUsers(page: number = 1, limit: number = 20, search: string = ''): Promise<ApiResponse<PaginatedUsersResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search.trim()
    });
    
    return this.fetchWithErrorHandling<PaginatedUsersResponse>(`${API_BASE_URL}/users?${params}`);
  }

  /**
   * Retrieves all users without pagination (for backward compatibility)
   * @returns Promise<ApiResponse<User[]>> - Array of all users
   */
  async getAllUsersUnpaginated(): Promise<ApiResponse<User[]>> {
    return this.fetchWithErrorHandling<User[]>(`${API_BASE_URL}/users?limit=1000`);
  }

  /**
   * Retrieves a specific user by their ID
   * @param id - The unique identifier of the user
   * @returns Promise<ApiResponse<User | null>> - User object or null if not found
   */
  async getUserById(id: string): Promise<ApiResponse<User | null>> {
    const response = await this.fetchWithErrorHandling<User>(`${API_BASE_URL}/users/${id}`);
    
    // Handle 404 Not Found responses specifically
    if (!response.success && response.message.includes('404')) {
      return {
        data: null,
        success: false,
        message: 'User not found'
      };
    }
    
    return response;
  }

  /**
   * Creates a new user in the database
   * @param userData - The user data from the form
   * @returns Promise<ApiResponse<User>> - The created user object
   */
  async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
    return this.fetchWithErrorHandling<User>(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Updates an existing user in the database
   * @param id - The unique identifier of the user to update
   * @param userData - Partial user data containing only fields to update
   * @returns Promise<ApiResponse<User>> - The updated user object
   */
  async updateUser(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
    return this.fetchWithErrorHandling<User>(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Deletes a user from the database
   * @param id - The unique identifier of the user to delete
   * @returns Promise<ApiResponse<boolean>> - Success status of the deletion
   */
  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    const response = await this.fetchWithErrorHandling<{ message: string }>(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });

    // Transform the response to return a boolean for consistency
    return {
      data: response.success,
      success: response.success,
      message: response.message
    };
  }

  /**
   * Searches for users based on a query string
   * Uses server-side search with pagination support
   * @param query - Search term to match against user fields
   * @param page - Page number (default: 1)
   * @param limit - Number of users per page (default: 20)
   * @returns Promise<ApiResponse<PaginatedUsersResponse>> - Paginated search results
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedUsersResponse>> {
    return this.getAllUsers(page, limit, query);
  }
}

// Export a singleton instance of the API class
export const userAPI = new UserProfileAPI();