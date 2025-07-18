import {
  Content,
  Header,
  InfoCard,
  LinkButton,
} from '@backstage/core-components';
import { Box } from '@material-ui/core';
import { useState } from 'react';
import { CreateUserForm } from './CreateUserForm';
import { CreateGroupForm } from './CreateGroupForm';

export const UserGroupManager = () => {
  const [activeForm, setActiveForm] = useState('');

  const activeView = (form: string) => {
    switch (form) {
      case 'user':
        return <CreateUserForm />;
      case 'group':
        return <CreateGroupForm />;
      default:
        return (
          <Content noPadding>
            <Header title="Manage Users and Groups" />
            <Box padding={3}>
              <Box display="flex" flexDirection="row" gridGap={24}>
                <InfoCard
                  title="Create User"
                  subheader="Create a new user in the organisation."
                >
                  <LinkButton
                    to="#"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setActiveForm('user');
                    }}
                  >
                    Create
                  </LinkButton>
                </InfoCard>
                <InfoCard
                  title="Create Group"
                  subheader="Create a new group in the organisation."
                >
                  <LinkButton
                    to="#"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setActiveForm('group');
                    }}
                  >
                    Create
                  </LinkButton>
                </InfoCard>
              </Box>
            </Box>
          </Content>
        );
    }
  };

  return activeView(activeForm);
};
