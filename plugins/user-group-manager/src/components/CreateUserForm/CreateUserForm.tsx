import React, { useState } from 'react';
import {
  Content,
  Header,
  InfoCard,
  CodeSnippet,
  Select,
  SelectedItems,
} from '@backstage/core-components';
import TextField from '@material-ui/core/TextField';
import { Box, Button, FormControl } from '@material-ui/core';
import yaml from 'js-yaml';
import { useApi, configApiRef, alertApiRef } from '@backstage/core-plugin-api';

const initialForm = {
  name: '',
  displayName: '',
  email: '',
  picture: '',
  github: '',
  groups: [],
};

export const CreateUserForm = () => {
  const [form, setForm] = useState(initialForm);
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);

  const alertApi = useApi(alertApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = config.getString('backend.baseUrl');

  // TODO: extract groups from org.yaml
  const groupOptions = [
    { label: 'engineering', value: 'engineering' },
    { label: 'design', value: 'design' },
    { label: 'devops', value: 'devops' },
    { label: 'marketing', value: 'marketing' },
  ];

  const handleChange = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const userYaml = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: form.name,
        annotations: {
          'backstage.io/github-user': form.github,
        },
      },
      spec: {
        profile: {
          displayName: form.displayName,
          email: form.email,
          picture: form.picture,
        },
        memberOf: form.groups,
      },
    };

    const yamlString = yaml.dump(userYaml);
    setYamlPreview(yamlString);
    saveToCatalog(yamlString);
    setForm(initialForm);
  };

  const saveToCatalog = async (yamlString: string) => {
    try {
      const appendResponse = await fetch(
        `${backendBaseUrl}/api/user-entity/add`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/yaml' },
          body: yamlString,
        },
      );

      if (!appendResponse.ok) {
        console.error('Failed to save:', await appendResponse.text());
        alertApi.post({
          message: 'Failed to save: Internal Server Error',
          severity: 'error',
          display: 'transient',
        });
        return;
      }

      const registerResponse = await fetch(
        `${backendBaseUrl}/api/user-entity/register?name=${form.name}`,
        {
          method: 'GET',
        },
      );

      if (registerResponse.ok) {
        alertApi.post({
          message: 'User entity registered in catalog successfully!',
          severity: 'success',
          display: 'transient',
        });
      } else {
        console.error('Failed to register:', await registerResponse.text());

        alertApi.post({
          message: 'YAML saved, but catalog registration failed.',
          severity: 'error',
          display: 'transient',
        });
      }
    } catch (err) {
      console.error('Error saving YAML:', err);
      alertApi.post({
        message: 'Error saving YAML!',
        severity: 'error',
        display: 'transient',
      });
    }
  };

  return (
    <Content noPadding>
      <Header title="Create a User Entity" />
      <Box padding={3}>
        <Box display="flex" flexDirection="column" gridGap={20}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('name', e.target.value)
            }
          />
          <TextField
            label="Display Name"
            value={form.displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('displayName', e.target.value)
            }
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('email', e.target.value)
            }
          />
          <TextField
            label="Picture URL"
            value={form.picture}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('picture', e.target.value)
            }
          />
          <TextField
            label="GitHub Username"
            value={form.github}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('github', e.target.value)
            }
          />
          <FormControl variant="outlined" margin="normal">
            <Select
              label="Groups"
              onChange={(e: SelectedItems) => {
                handleChange('groups', e as string | string[]);
              }}
              selected={form.groups}
              items={groupOptions}
              multiple
            />
          </FormControl>
          <Box marginTop={1}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Create
            </Button>
          </Box>
          {yamlPreview && (
            <Box marginTop={2}>
              <InfoCard title="YAML Preview">
                <CodeSnippet language="yaml" text={yamlPreview} />
              </InfoCard>
            </Box>
          )}
        </Box>
      </Box>
    </Content>
  );
};
