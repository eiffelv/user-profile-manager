# user-profile-manager by Eiffel Valentino

## Overview

This is the submission for a basic User Profile Management application built with React and TypeScript. The app now has backend database integration and new functionalities implemented.

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
   - Ensured data persistence across browser refreshes

### Task 2: QR Code Functionality

#### Estimated Time: 45-60 minutes

1. **QR Code Generation**
   - Add a "Generate QR Code" button to user profile cards
   - Generate QR codes containing user profile information (JSON format recommended)
   - Display QR code in a modal or dedicated section
   - Provide download functionality for the QR code image

2. **QR Code Reading**
   - Implement QR code scanner/reader functionality
   - Allow users to upload QR code images or use camera (if supported)
   - Parse QR code data and populate the user profile form
   - Handle invalid QR codes gracefully with appropriate error messages

### Task 3: Choose One Enhancement (Required)
**Estimated Time: 30-45 minutes**

Select ONE of the following enhancements to implement:

#### Option A: Performance Optimization
- Implement pagination for the user list (20 users per page)
- Add debounced search functionality
- Optimize avatar image handling (compression, lazy loading)
- Add caching strategies for API responses

#### Option B: Security Improvements
- Implement input sanitization and validation
- Add rate limiting to API endpoints
- Implement basic authentication/authorization
- Add CORS configuration and security headers

#### Option C: Advanced Features
- Add user categories or tags
- Implement export functionality (CSV/JSON)
- Add advanced search filters (by location, date range, etc.)
- Implement user profile comparison feature

## Setup Instructions

1. Clone this repository
2. Install dependencies: `npm install`
3. Set environment variable by creating .env file in the repository with the contents below
   - `DATABASE_URL=<link-given-in-email>`
4. Run database migrations: `npx prisma migrate dev`
5. Start the application: `npm run dev`

.env

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

### Recommended Libraries

- **ORM**: Prisma, TypeORM, or Sequelize
- **QR Code**: `qrcode` (generation), `qr-scanner` or `jsqr` (reading)
- **File Upload**: `multer` (if implementing file uploads)
- **HTTP Client**: `axios` or `fetch`

## Evaluation Criteria

### Code Quality (25%)

- Clean, readable, and well-structured code
- Proper error handling and edge cases
- Consistent code style and TypeScript usage
- Meaningful commit messages

### Functionality (35%)

- All required features working correctly
- Database integration properly implemented
- QR code features functioning as expected
- Chosen enhancement properly implemented

### Technical Implementation (25%)

- Appropriate use of ORM and database operations
- Efficient API design and data flow
- Proper state management and data synchronization
- Good separation of concerns

### User Experience (15%)

- Intuitive and responsive interface
- Appropriate loading states and error messages
- Smooth user interactions
- Accessibility considerations

## Submission Guidelines

1. **Code Repository**
   - Push your code to a GitHub repository
   - Include a comprehensive README.md with:
     - Setup instructions
     - Database schema and migration commands
     - API documentation
     - Features implemented and design decisions

2. **Documentation**
   - Comment your code appropriately
   - Explain any architectural decisions
   - Include environment setup instructions
   - Document any assumptions made

3. **Testing (Optional)**
   - Include basic tests if time permits
   - Focus on critical functionality
   - Document test coverage

## Questions?

If you have any clarification questions about the requirements, please document your assumptions in your README.md file and proceed with your best interpretation.

## Time Management Tips

- Start with database setup and basic API endpoints
- Implement QR code functionality next
- Leave the enhancement task for last
- Focus on working functionality over perfect code
- Don't over-engineer - simple solutions are preferred

Good luck! We're excited to see your implementation.