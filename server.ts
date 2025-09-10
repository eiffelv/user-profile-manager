import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Get user by id
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  res.json(user);
});

// Create user
app.post('/api/users', async (req, res) => {
  const { fullName, email, phoneNumber, bio, avatarUrl, dateOfBirth, location } = req.body;
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
  res.json(user);
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phoneNumber, bio, avatarUrl, dateOfBirth, location } = req.body;
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
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { id },
  });
  res.json({ message: 'User deleted successfully' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
