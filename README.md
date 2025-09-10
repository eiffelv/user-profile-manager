# user-profile-manager by Eiffel Valentino

## Overview

This is the submission for a basic User Profile Management application built with React and TypeScript. The app now has backend database integration and new functionalities implemented.

## Live Server

This submission is also [deployed live here](https://user-profile-manager-nine.vercel.app/)

## Given Application State

The existing application includes:

- ✅ Frontend React components for user profile CRUD operations
- ✅ Mock data and local state management
- ✅ Modern UI with Tailwind CSS
- ✅ TypeScript interfaces and type definitions
- ✅ Basic form validation and error handling
- ✅ Responsive design

## Tasks Completed

### Task 1: Database Integration

1. **Set up PostgreSQL database**
   - PostgreSQL database created in the cloud (Using Prisma Postgres)
   - Implemented the Users table schema

2. **Backend API Development**
   - Prisma is used for the ORM framework with the project set up with Prisma schema already
   - Created API endpoints for CRUD operations with error-handling:
     - `GET /api/users` - Retrieve all users
     - `GET /api/users/:id` - Retrieve a specific user
     - `POST /api/users` - Create a new user
     - `PUT /api/users/:id` - Update an existing user
     - `DELETE /api/users/:id` - Delete a user

3. **Frontend Integration**
   - Replaced mock API functions in `lib/api.ts` with real HTTP requests
   - Proper handling of loading states and error responses
   - Ensures data persistence across browser refreshes

### Task 2: QR Code Functionality

#### Estimated Time: 45-60 minutes

1. **QR Code Generation**
   - Added a "Generate QR Code" button to user profile cards
   - Generates QR codes containing user profile information (Into JSON format)
   - Displays QR code in a modal
   - Provides download functionality for the QR code image

2. **QR Code Reading**
   - Implemented QR code scanner/reader functionality
   - Allows users to upload QR code images or use camera (if available)
   - Parses QR code data and populates the user profile form
   - Handles invalid QR codes gracefully with appropriate error messages

### Task 3: Choosen One Enhancement

#### Option A: Performance Optimization

- Implement pagination for the user list (20 users per page)
- Add debounced search functionality
- Optimize avatar image handling (compression, lazy loading)
- Add caching strategies for API responses

## Setup Instructions

1. Clone this repository
2. Install dependencies: `npm install`
3. Set the environment variable by creating .env file in the repository with the contents below
4. Run database migrations: `npx prisma migrate dev`
5. Start the backend: `npm run start:server`
6. In another terminal, start the application: `npm run dev`

```bash
DATABASE_URL=<link-given-in-email>
```

## Technical Requirements

### Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    bio TEXT,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Libraries Used

- **ORM**: Prisma,
- **QR Code**: `qrcode` (generation), `qr-scanner` (reading)
- **File Upload**: Not implemented
- **HTTP Client**: `fetch`
