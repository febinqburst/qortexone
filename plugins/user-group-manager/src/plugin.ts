import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { addGroupRouteRef, addUserRouteRef, rootRouteRef } from './routes';

export const userGroupManagerPlugin = createPlugin({
  id: 'user-group-manager',
  routes: {
    root: rootRouteRef,
    'add-user': addUserRouteRef,
    'add-group': addGroupRouteRef,
  },
});

export const UserGroupManagerPage = userGroupManagerPlugin.provide(
  createRoutableExtension({
    name: 'UserGroupManagerPage',
    component: () => import('./components/index').then(m => m.UserGroupManager),
    mountPoint: rootRouteRef,
  }),
);

export const AddUserPage = userGroupManagerPlugin.provide(
  createRoutableExtension({
    name: 'AddUserPage',
    component: () =>
      import('./components/CreateUserForm/index').then(m => m.CreateUserForm),
    mountPoint: addUserRouteRef,
  }),
);

export const AddGroupPage = userGroupManagerPlugin.provide(
  createRoutableExtension({
    name: 'AddGroupPage',
    component: () =>
      import('./components/CreateGroupForm/index').then(m => m.CreateGroupForm),
    mountPoint: addGroupRouteRef,
  }),
);
