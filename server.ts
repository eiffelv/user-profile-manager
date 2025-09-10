import express from 'express';
import { PrismaClient } from '@prisma/client';

/**
 * Express server with Prisma ORM for User Profile Management
 * Provides RESTful API endpoints for CRUD operations on users
 */

const app = express();
const prisma = new PrismaClient();

// ===== MIDDLEWARE SETUP =====

// Parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

// CORS (Cross-Origin Resource Sharing) middleware
// Allows frontend (localhost:5173) to communicate with backend (localhost:3001)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins (dev only)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight OPTIONS requests for browsers
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ===== API ROUTES =====

/**
 * GET /api/users
 * Retrieves all users from the database
 * @returns {User[]} Array of user objects ordered by creation date (newest first)
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/:id
 * Retrieves a specific user by their ID
 * @param {string} id - UUID of the user
 * @returns {User} User object or 404 if not found
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/users
 * Creates a new user in the database
 * @body {UserFormData} User data (fullName and email are required)
 * @returns {User} Created user object with generated ID and timestamps
 */
app.post('/api/users', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, avatarUrl, dateOfBirth, location } = req.body;
    
    // Basic validation - required fields
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        bio,
        avatarUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        location,
      },
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

/**
 * PUT /api/users/:id
 * Updates an existing user in the database
 * @param {string} id - UUID of the user to update
 * @body {Partial<UserFormData>} Updated user data
 * @returns {User} Updated user object
 */
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, bio, avatarUrl, dateOfBirth, location } = req.body;
    
    // Basic validation - required fields
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phoneNumber,
        bio,
        avatarUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        location,
      },
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle specific Prisma error codes
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
});

/**
 * DELETE /api/users/:id
 * Deletes a user from the database
 * @param {string} id - UUID of the user to delete
 * @returns {Object} Success message or error
 */
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id },
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle user not found error
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
});

// ===== SERVER STARTUP =====

// ===== SERVER STARTUP =====

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Database connected via Prisma`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
});

// ===== GRACEFUL SHUTDOWN =====

// Handle graceful shutdown to properly close database connections
process.on('beforeExit', async () => {
  console.log('🔄 Disconnecting from database...');
  await prisma.$disconnect();
});

// Handle Ctrl+C (SIGINT) for graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected. Exiting...');
  process.exit(0);
});
