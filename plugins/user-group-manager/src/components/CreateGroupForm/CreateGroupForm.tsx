import {
  CodeSnippet,
  Content,
  Header,
  InfoCard,
} from '@backstage/core-components';
import {
  alertApiRef,
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { Box, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import yaml from 'js-yaml';
import React, { useState } from 'react';

const initialForm = {
  name: '',
  displayName: '',
  type: '',
  children: [],
};

export const CreateGroupForm = () => {
  const [form, setForm] = useState(initialForm);
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);

  const alertApi = useApi(alertApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = config.getString('backend.baseUrl');
  const credentials = useApi(identityApiRef).getCredentials();

  const handleChange = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const { name, displayName, type, children } = form;

    if (!name) {
      console.error('Missing form fields');
      alertApi.post({
        message: 'Missing form fields',
        severity: 'error',
        display: 'transient',
      });
      return;
    }

    const groupYaml = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: name },
      spec: {
        type: type,
        profile: {
          displayName: displayName,
        },
        children: children || [],
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
          headers: {
            'Content-Type': 'text/yaml',
            Authorization: `Bearer ${(await credentials).token}`,
          },
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

      const catalogLocations = await fetch(
        `${backendBaseUrl}/api/catalog/entities?filter=kind=location,spec.type=file`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${(await credentials).token}`,
          },
        },
      );
      const locationsJSON = await catalogLocations.json();
      let entityRef = '';
      locationsJSON.forEach((r: any) => {
        if (r.spec.target.includes('org.yaml')) {
          entityRef = `location:${r.metadata.namespace}/${r.metadata.name}`;
        }
      });

      const refreshResponse = await fetch(
        `${backendBaseUrl}/api/catalog/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await credentials).token}`,
          },
          body: JSON.stringify({ entityRef: entityRef }),
        },
      );

      if (!refreshResponse.ok) {
        console.error('Failed to refresh:', await refreshResponse.text());
        alertApi.post({
          message: 'Saved group but failed to refresh',
          severity: 'warning',
          display: 'transient',
        });
      } else {
        alertApi.post({
          message: 'Saved group successfully!',
          severity: 'success',
          display: 'transient',
        });
      }
    } catch (err) {
      console.error('Error saving group:', err);
      alertApi.post({
        message: 'Error saving the group details',
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.trim();
              if (
                value === '' ||
                /^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/.test(value)
              ) {
                handleChange('name', value);
              }
            }}
            placeholder="Letters and Numbers separated by [-_]"
            required
          />
          <TextField
            label="Display Name"
            value={form.displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('displayName', e.target.value)
            }
            placeholder="Enter a Display Name"
          />
          <TextField
            label="Group Type"
            value={form.type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.trim();
              if (
                value === '' ||
                (/^[a-z][a-z0-9-]*$/g.test(value) && value.length < 30)
              ) {
                handleChange('type', value);
              }
            }}
            placeholder="Lowercase, multiple words separated my hiphen [-]"
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
