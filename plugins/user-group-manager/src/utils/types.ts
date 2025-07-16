export type UserFormData = {
  name: string;
  displayName: string;
  email: string;
  picture: string;
  github: string;
  groups: never[];
};

export type GroupFormData = {
  name: string;
  displayName: string;
  type: string;
  children: string[];
  parent: string;
};
