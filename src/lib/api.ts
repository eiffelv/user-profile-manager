import { User, UserFormData, ApiResponse } from './types';

// Mock API service layer
// Replace these functions with actual API calls when integrating with backend

class UserProfileAPI {
  private users: User[] = [];
  private readonly STORAGE_KEY = 'userProfiles';

  constructor() {
    this.loadFromStorage();
    if (this.users.length === 0) {
      this.initializeMockData();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      this.users = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private initializeMockData(): void {
    const mockUsers: User[] = [
      {
        id: '1',
        fullName: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phoneNumber: '+1 (555) 123-4567',
        bio: 'Full-stack developer with a passion for creating intuitive user experiences. Love working with React, Node.js, and exploring new technologies.',
        avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        dateOfBirth: '1990-03-15',
        location: 'San Francisco, CA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        fullName: 'Michael Chen',
        email: 'michael.chen@example.com',
        phoneNumber: '+1 (555) 987-6543',
        bio: 'UX/UI Designer focused on creating meaningful digital experiences. Specializing in mobile-first design and accessibility.',
        avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
        dateOfBirth: '1988-07-22',
        location: 'New York, NY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        fullName: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        phoneNumber: '+1 (555) 456-7890',
        bio: 'Product manager with 8+ years of experience in tech startups. Passionate about user-centered product development.',
        avatarUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
        dateOfBirth: '1985-11-08',
        location: 'Austin, TX',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        fullName: 'David Kim',
        email: 'david.kim@example.com',
        phoneNumber: '+1 (555) 321-0987',
        bio: 'DevOps engineer specializing in cloud infrastructure and automation. AWS certified with expertise in Docker and Kubernetes.',
        avatarUrl: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
        dateOfBirth: '1992-01-30',
        location: 'Seattle, WA',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    this.users = mockUsers;
    this.saveToStorage();
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      data: [...this.users],
      success: true,
      message: 'Users retrieved successfully'
    };
  }

  async getUserById(id: string): Promise<ApiResponse<User | null>> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = this.users.find(u => u.id === id);
    return {
      data: user || null,
      success: !!user,
      message: user ? 'User found' : 'User not found'
    };
  }

  async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveToStorage();

    return {
      data: newUser,
      success: true,
      message: 'User created successfully'
    };
  }

  async updateUser(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return {
        data: {} as User,
        success: false,
        message: 'User not found'
      };
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage();

    return {
      data: this.users[userIndex],
      success: true,
      message: 'User updated successfully'
    };
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return {
        data: false,
        success: false,
        message: 'User not found'
      };
    }

    this.users.splice(userIndex, 1);
    this.saveToStorage();

    return {
      data: true,
      success: true,
      message: 'User deleted successfully'
    };
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    await new Promise(resolve => setTimeout(resolve, 250));

    const normalizedQuery = query.toLowerCase().trim();
    const filteredUsers = this.users.filter(user => 
      user.fullName.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      (user.location && user.location.toLowerCase().includes(normalizedQuery)) ||
      (user.bio && user.bio.toLowerCase().includes(normalizedQuery))
    );

    return {
      data: filteredUsers,
      success: true,
      message: `Found ${filteredUsers.length} users`
    };
  }
}

export const userAPI = new UserProfileAPI();