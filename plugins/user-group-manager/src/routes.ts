import { createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'user-group-manager',
});
export const addUserRouteRef = createRouteRef({ id: 'add-user' });
export const addGroupRouteRef = createRouteRef({ id: 'add-group' });
