import React, { useState } from 'react';
import {
  Content,
  Header,
  InfoCard,
  CodeSnippet,
  Select,
  LinkButton,
  SelectedItems,
} from '@backstage/core-components';
import TextField from '@material-ui/core/TextField';
import { Box, FormControl } from '@material-ui/core';
import yaml from 'js-yaml';

export const CreateUserForm = () => {
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    email: '',
    picture: '',
    github: '',
    groups: [],
  });
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);

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
  };

  const saveToCatalog = async (yamlString: string) => {
    try {
      const response = await fetch('http://localhost:7007/api/user-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/yaml' },
        body: yamlString,
      });

      if (response.ok) {
        alert('User entity appended to org.yaml successfully!');
      } else {
        console.error('Failed to save:', await response.text());
        alert('Failed to save YAML to catalog.');
      }
    } catch (err) {
      console.error('Error sending YAML:', err);
      alert('An error occurred while saving.');
    }
  };

  return (
    <Content>
      <Header title="Create a User Entity" />
      <Box padding={3}>
        <Box display="flex" flexDirection="column" gridGap={24}>
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
              items={groupOptions}
              multiple
            />
          </FormControl>
          <Box marginTop={1}>
            <LinkButton
              to="#"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Create
            </LinkButton>
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
