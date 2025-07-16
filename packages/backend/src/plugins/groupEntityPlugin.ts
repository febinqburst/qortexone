import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

export const groupEntityRouter = createBackendPlugin({
  pluginId: 'group-entity',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
      },
      async init({ http }) {
        const router = Router();
        router.use(cors({ origin: 'http://localhost:3000' }));

        router.post('/', (req, res) => {
          let body = '';
          req.setEncoding('utf8');
          req.on('data', chunk => (body += chunk));
          req.on('end', () => {
            const orgPath = path.resolve(
              __dirname,
              '../../../../examples/org.yaml',
            );

            const appendText = `\n---\n${body.trim()}\n`;

            try {
              fs.appendFileSync(orgPath, appendText);
              res.status(200).send('Entity appended to org.yaml');
            } catch (err) {
              console.error('Failed to append:', err);
              res.status(500).send('Failed to save entity');
            }
          });
        });
        http.use(router);
        http.addAuthPolicy({ path: '/', allow: 'unauthenticated' });
      },
    });
  },
});
