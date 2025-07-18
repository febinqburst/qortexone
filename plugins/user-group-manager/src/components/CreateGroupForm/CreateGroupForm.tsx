import {
  CodeSnippet,
  Content,
  Header,
  InfoCard,
} from '@backstage/core-components';
import { alertApiRef, configApiRef, useApi } from '@backstage/core-plugin-api';
import { Box, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import yaml from 'js-yaml';
import React, { useState } from 'react';

const initialForm = {
  name: '',
  displayName: '',
  type: '',
  children: [],
  parent: '',
};

export const CreateGroupForm = () => {
  const [form, setForm] = useState(initialForm);
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);

  const alertApi = useApi(alertApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = config.getString('backend.baseUrl');

  const handleChange = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const groupYaml = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: form.name },
      spec: {
        type: form.type,
        profile: {
          displayName: form.displayName,
        },
        children: form.children || [],
      },
    };

    const yamlString = yaml.dump(groupYaml);
    setYamlPreview(yamlString);
    saveToCatalog(yamlString);
    setForm(initialForm);
  };

  const saveToCatalog = async (yamlString: string) => {
    try {
      const appendResponse = await fetch(
        `${backendBaseUrl}/api/group-entity/add`,
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
        `${backendBaseUrl}/api/group-entity/register?name=${form.name}`,
        {
          method: 'GET',
        },
      );

      if (registerResponse.ok) {
        alertApi.post({
          message: 'Group entity registered in catalog successfully!',
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
      <Header title="Create a Group Entity" />
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
            label="Group Type"
            value={form.type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('type', e.target.value)
            }
          />
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
