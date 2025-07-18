import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { CatalogClient } from '@backstage/catalog-client';

export const groupEntityRouter = createBackendPlugin({
  pluginId: 'group-entity',
  register(env) {
    env.registerInit({
      deps: {
        http: coreServices.httpRouter,
        discovery: coreServices.discovery,
        config: coreServices.rootConfig,
      },
      async init({ http, discovery, config }) {
        const router = Router();
        const appBaseUrl = config.getString('app.baseUrl');
        const backendBaseUrl = config.getString('backend.baseUrl');
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

        router.get('/org.yaml', (_req, res) => {
          const filePath = path.resolve(
            __dirname,
            '../../../../examples/org.yaml',
          );
          const yamlContent = fs.readFileSync(filePath, 'utf8');
          res.type('text/yaml').send(yamlContent);
        });

        router.get('/register', async (req, res) => {
          const catalogClient = new CatalogClient({
            discoveryApi: discovery,
          });
          const existingLocations = await catalogClient.getLocations();
          const alreadyExists = existingLocations?.items?.some(
            loc => loc.target === `${backendBaseUrl}/api/group-entity/org.yaml`,
          );
          const groupName = req.query.name || '';

          try {
            if (!alreadyExists) {
              await catalogClient.addLocation({
                type: 'url',
                target: `${backendBaseUrl}/api/group-entity/org.yaml`,
              });
              if (groupName) {
                await catalogClient.refreshEntity(`group:default/${groupName}`);
              }
            }
          } catch (err) {
            console.error(err);
            res.status(500).send('failed to fetch org.yaml');
          }

          res.status(200).send('org.yaml registered');
        });

        http.use(router);
        http.addAuthPolicy({ path: '/', allow: 'unauthenticated' });
      },
    });
  },
});
