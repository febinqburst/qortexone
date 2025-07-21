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
        config: coreServices.rootConfig,
      },
      async init({ http, config }) {
        const router = Router();
        const appBaseUrl = config.getString('app.baseUrl');
        router.use(cors({ origin: appBaseUrl }));

        router.post('/add', (req, res) => {
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
      },
    });
  },
});
