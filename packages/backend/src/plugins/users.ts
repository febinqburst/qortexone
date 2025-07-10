import { createBackendModule } from '@backstage/backend-plugin-api';
import { Router } from 'express';
import { z } from 'zod';
import { Entity } from '@backstage/catalog-model';

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

// Helper function to create a catalog entity from user data
function createUserEntity(user: User): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: user.name,
      annotations: {
        'backstage.io/managed-by-location': 'users-plugin',
      },
    },
    spec: {
      profile: {
        displayName: user.displayName,
        email: user.email,
      },
      memberOf: user.memberOf ? [user.memberOf] : [],
    },
  };
}

export const usersPlugin = createBackendModule({
  pluginId: 'users',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: 'core.logger',
        httpRouter: 'core.httpRouter',
        catalog: 'plugin.catalog.service',
      },
      async init({ logger, httpRouter, catalog }) {
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
            
            // Create catalog entity and register it
            try {
              const userEntity = createUserEntity(validatedUser);
              await catalogClient.createEntity(userEntity);
              logger.info('User registered in catalog', { username: validatedUser.name });
            } catch (catalogError) {
              logger.warn('Failed to register user in catalog', { 
                username: validatedUser.name, 
                error: catalogError 
              });
              // Don't fail the request if catalog registration fails
            }
            
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
        router.delete('/users/:name', async (req, res) => {
          const { name } = req.params;
          const userIndex = users.findIndex(u => u.name === name);
          
          if (userIndex === -1) {
            return res.status(404).json({
              error: 'User not found',
              message: `User '${name}' not found`
            });
          }
          
          const deletedUser = users.splice(userIndex, 1)[0];
          
          // Remove from catalog if possible
          try {
            await catalogClient.removeEntityByUid(`user:default/${name}`);
            logger.info('User removed from catalog', { username: deletedUser.name });
          } catch (catalogError) {
            logger.warn('Failed to remove user from catalog', { 
              username: deletedUser.name, 
              error: catalogError 
            });
            // Don't fail the request if catalog removal fails
          }
          
          logger.info('Deleted user', { username: deletedUser.name });
          
          res.json({
            message: 'User deleted successfully',
            user: deletedUser
          });
        });

        // PUT /api/users/:name - Update a user
        router.put('/users/:name', async (req, res) => {
          try {
            const { name } = req.params;
            const userIndex = users.findIndex(u => u.name === name);
            
            if (userIndex === -1) {
              return res.status(404).json({
                error: 'User not found',
                message: `User '${name}' not found`
              });
            }

            // Validate the request body
            const validatedUser = UserSchema.parse(req.body);
            
            // Check if email already exists for a different user
            const existingEmail = users.find(user => 
              user.email === validatedUser.email && user.name !== name
            );
            if (existingEmail) {
              return res.status(409).json({
                error: 'Email already exists',
                message: `A user with email '${validatedUser.email}' already exists`
              });
            }

            // Update user
            users[userIndex] = validatedUser;
            
            // Update catalog entity
            try {
              const userEntity = createUserEntity(validatedUser);
              await catalogClient.createEntity(userEntity);
              logger.info('User updated in catalog', { username: validatedUser.name });
            } catch (catalogError) {
              logger.warn('Failed to update user in catalog', { 
                username: validatedUser.name, 
                error: catalogError 
              });
            }
            
            logger.info('Updated user', { username: validatedUser.name });
            
            res.json({
              message: 'User updated successfully',
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
            
            logger.error('Error updating user', { error });
            res.status(500).json({
              error: 'Internal server error',
              message: 'Failed to update user'
            });
          }
        });

        httpRouter.use('/users', router);
      },
    });
  },
}); 