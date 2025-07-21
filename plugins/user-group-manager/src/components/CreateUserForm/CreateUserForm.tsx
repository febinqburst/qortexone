import React, { useEffect, useState } from 'react';
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
import {
  useApi,
  configApiRef,
  alertApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

const initialForm = {
  name: '',
  displayName: '',
  email: '',
  picture: '',
  github: '',
  groups: [],
};
const initialGroup = [{ label: 'Please select an option', value: '' }];

export const CreateUserForm = () => {
  const [form, setForm] = useState(initialForm);
  const [yamlPreview, setYamlPreview] = useState<string | null>(null);
  const [groups, setGroups] = useState(initialGroup);

  const alertApi = useApi(alertApiRef);
  const config = useApi(configApiRef);
  const backendBaseUrl = config.getString('backend.baseUrl');
  const credentials = useApi(identityApiRef).getCredentials();

  const fetchAndSetGroups = async () => {
    const catalogGroups = await fetch(
      `${backendBaseUrl}/api/catalog/entities?filter=kind=group`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${(await credentials).token}`,
        },
      },
    );

    if (!catalogGroups.ok) {
      console.error(
        'Error fetching catalog groups: ',
        await catalogGroups.text(),
      );
      setGroups(initialGroup);
      return;
    }

    const groupsJSON = await catalogGroups.json();

    const groups = groupsJSON?.map((r: any) => {
      return {
        label: r?.spec?.profile?.displayName ?? r.metadata.name,
        value: r.metadata.name,
      };
    });

    setGroups(groups);
  };

  useEffect(() => {
    fetchAndSetGroups();
  }, []);

  const handleChange = (field: string, value: string | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const { name, displayName, github, email, picture, groups } = form;

    if (!name || !github || !email) {
      console.error('Missing form fields');
      alertApi.post({
        message: 'Missing form fields',
        severity: 'error',
        display: 'transient',
      });
      return;
    }

    if (
      (name && /^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/.test(name)) ||
      (picture &&
        !/https?:\/\/(?:www\.)?[^\s]+(?:\.(?:jpg|jpeg|png|gif|bmp))?/.test(
          picture,
        )) ||
      (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
    ) {
      console.error('Invalid form field(s)');
      alertApi.post({
        message: 'Invalid form field(s)',
        severity: 'error',
        display: 'transient',
      });
      return;
    }

    let userYaml = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: name,
        annotations: {
          'backstage.io/github-user': github,
        },
      },
      spec: {
        profile: {
          displayName: displayName,
          email: email,
        },
        memberOf: groups,
      },
    };

    if (picture) {
      userYaml = Object.assign(
        {},
        {
          ...userYaml,
          spec: {
            ...userYaml.spec,
            profile: {
              ...userYaml.spec.profile,
              picture,
            },
          },
        },
      );
    }

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
          message: 'Saved user but failed to refresh',
          severity: 'warning',
          display: 'transient',
        });
      } else {
        alertApi.post({
          message: 'Saved user successfully!',
          severity: 'success',
          display: 'transient',
        });
      }
    } catch (err) {
      console.error('Error saving user:', err);
      alertApi.post({
        message: 'Error saving the user detials!',
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
            placeholder="Letters and Numbers separated by [-_]"
            required
          />
          <TextField
            label="Display Name"
            value={form.displayName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('displayName', e.target.value)
            }
            placeholder="Enter Display Name"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('email', e.target.value)
            }
            placeholder="Enter a valid email"
            required
          />
          <TextField
            label="Picture URL"
            value={form.picture}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('picture', e.target.value)
            }
            placeholder="Enter a valid image URL"
          />
          <TextField
            label="GitHub Username"
            value={form.github}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange('github', e.target.value)
            }
            placeholder="Enter a valid github username"
            required
          />
          <FormControl variant="outlined" margin="normal">
            <Select
              label="Groups"
              onChange={(e: SelectedItems) => {
                handleChange('groups', e as string | string[]);
              }}
              selected={form.groups}
              items={groups}
              multiple
              placeholder="Select groups"
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
