import { createBackendModule } from '@backstage/backend-plugin-api';
import { createRouter } from '@backstage/backend-common';
import { Router } from 'express';
import { z } from 'zod';

// User schema for validation
const UserSchema = z.object({
  name: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  email: z.string().email('Invalid email address'),
  memberOf: z.string().optional(),
});

type User = z.infer<typeof UserSchema>;

// In-memory storage (in production, you'd use a database)
const users: User[] = [];

export const usersPlugin = createBackendModule({
  pluginId: 'users',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: 'core.logger',
        httpRouter: 'core.httpRouter',
      },
      async init({ logger, httpRouter }) {
        const router = Router();

        // GET /api/users - List all users
        router.get('/users', (_, res) => {
          logger.info('Retrieved all users');
          res.json(users);
        });

        // POST /api/users - Create a new user
        router.post('/users', async (req, res) => {
          try {
            // Validate the request body
            const validatedUser = UserSchema.parse(req.body);
            
            // Check if user already exists
            const existingUser = users.find(user => user.name === validatedUser.name);
            if (existingUser) {
              return res.status(409).json({
                error: 'User already exists',
                message: `A user with username '${validatedUser.name}' already exists`
              });
            }

            // Check if email already exists
            const existingEmail = users.find(user => user.email === validatedUser.email);
            if (existingEmail) {
              return res.status(409).json({
                error: 'Email already exists',
                message: `A user with email '${validatedUser.email}' already exists`
              });
            }

            // Add user to storage
            users.push(validatedUser);
            
            logger.info('Created new user', { username: validatedUser.name });
            
            res.status(201).json({
              message: 'User created successfully',
              user: validatedUser
            });
          } catch (error) {
            if (error instanceof z.ZodError) {
              logger.warn('Validation error', { errors: error.errors });
              return res.status(400).json({
                error: 'Validation failed',
                details: error.errors
              });
            }
            
            logger.error('Error creating user', { error });
            res.status(500).json({
              error: 'Internal server error',
              message: 'Failed to create user'
            });
          }
        });

        // GET /api/users/:name - Get a specific user
        router.get('/users/:name', (req, res) => {
          const { name } = req.params;
          const user = users.find(u => u.name === name);
          
          if (!user) {
            return res.status(404).json({
              error: 'User not found',
              message: `User '${name}' not found`
            });
          }
          
          res.json(user);
        });

        // DELETE /api/users/:name - Delete a user
        router.delete('/users/:name', (req, res) => {
          const { name } = req.params;
          const userIndex = users.findIndex(u => u.name === name);
          
          if (userIndex === -1) {
            return res.status(404).json({
              error: 'User not found',
              message: `User '${name}' not found`
            });
          }
          
          const deletedUser = users.splice(userIndex, 1)[0];
          logger.info('Deleted user', { username: deletedUser.name });
          
          res.json({
            message: 'User deleted successfully',
            user: deletedUser
          });
        });

        httpRouter.use(router);
      },
    });
  },
}); 