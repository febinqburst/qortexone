import { createDevApp } from '@backstage/dev-utils';
import { userGroupManagerPlugin, UserGroupManagerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(userGroupManagerPlugin)
  .addPage({
    element: <UserGroupManagerPage />,
    title: 'Root Page',
    path: '/user-group-manager',
  })
  .render();
