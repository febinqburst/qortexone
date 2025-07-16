import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const userGroupManagerPlugin = createPlugin({
  id: 'user-group-manager',
  routes: {
    root: rootRouteRef,
  },
});

export const UserGroupManagerPage = userGroupManagerPlugin.provide(
  createRoutableExtension({
    name: 'UserGroupManagerPage',
    component: () =>
      import('./components/index').then(m => m.UserGroupManager),
    mountPoint: rootRouteRef,
  }),
);
