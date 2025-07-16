import yaml from 'js-yaml';
import { GroupFormData, UserFormData } from './types';

export function generateUserYaml(data: UserFormData) {
  return yaml.dump({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: { name: data.name },
    spec: {
      profile: {
        displayName: data.displayName,
        email: data.email,
        picture: data.picture,
      },
      memberOf: data.groups,
    },
  });
}

export function generateGroupYaml(data: GroupFormData) {
  return yaml.dump({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: { name: data.name },
    spec: {
      profile: {
        displayName: data.displayName,
      },
    },
  });
}
