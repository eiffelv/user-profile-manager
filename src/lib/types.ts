// Type definitions for User Profile Management System
// Database schema comments for future PostgreSQL integration

/*
Expected PostgreSQL Schema:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  bio TEXT,
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
*/

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  avatarUrl: string;
  dateOfBirth: string;
  location: string;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  location?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}