import {
    CodeSnippet,
    Content,
    Header,
    InfoCard,
    LinkButton
} from '@backstage/core-components';
import { Box } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import yaml from 'js-yaml';
import React, { useState } from 'react';

export const CreateGroupForm = () => {
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    type: '',
    children: [],
    parent: ''
  });
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);

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
  };

  const saveToCatalog = async (yamlString: string) => {
    try {
      const response = await fetch('https://qortexone.qburst.build/api/group-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/yaml' },
        body: yamlString,
      });

      if (response.ok) {
        alert('Group entity appended to org.yaml successfully!');
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
      <Header title="Create a Group Entity" />
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
            label="Group Type"
            value={form.type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('type', e.target.value)
            }
          />
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
