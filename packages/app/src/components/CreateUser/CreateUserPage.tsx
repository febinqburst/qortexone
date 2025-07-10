import React, { useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Snackbar,
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
} from '@material-ui/core';
import { Content, Header, Page } from '@backstage/core-components';
import { FileCopy as FileCopyIcon } from '@material-ui/icons';

interface UserFormData {
  name: string;
  displayName: string;
  email: string;
  memberOf: string;
}

interface FormErrors {
  name?: string;
  displayName?: string;
  email?: string;
  memberOf?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },
    form: {
      marginTop: theme.spacing(2),
    },
    submitButton: {
      marginTop: theme.spacing(3),
    },
    errorText: {
      color: theme.palette.error.main,
      fontSize: '0.75rem',
      marginTop: theme.spacing(0.5),
    },
    yamlOutput: {
      backgroundColor: theme.palette.grey[100],
      padding: theme.spacing(2),
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.divider}`,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      position: 'relative',
    },
    copyButton: {
      position: 'absolute',
      top: theme.spacing(1),
      right: theme.spacing(1),
    },
    instructionsCard: {
      marginTop: theme.spacing(3),
      backgroundColor: theme.palette.info.light,
    },
  }),
);

const CreateUserPage = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    displayName: '',
    email: '',
    memberOf: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generatedYaml, setGeneratedYaml] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.name.trim()) {
      newErrors.name = 'Username is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Username must be 50 characters or less';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors.name = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length > 100) {
      newErrors.displayName = 'Display name must be 100 characters or less';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const generateYaml = (userData: UserFormData): string => {
    const memberOfLine = userData.memberOf ? `  memberOf: [${userData.memberOf}]` : '';
    
    return `---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: ${userData.name}
spec:
  profile:
    displayName: ${userData.displayName}
    email: ${userData.email}${memberOfLine ? '\n' + memberOfLine : ''}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const yamlContent = generateYaml(formData);
      setGeneratedYaml(yamlContent);
      
      // Success
      setSnackbar({
        open: true,
        message: 'User YAML generated successfully! Follow the instructions below to add the user to your catalog.',
        severity: 'success',
      });

    } catch (error) {
      console.error('Error generating YAML:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate user YAML',
        severity: 'error',
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedYaml);
      setSnackbar({
        open: true,
        message: 'YAML copied to clipboard!',
        severity: 'info',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Page themeId="home">
      <Header title="Create User" />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={10}>
            <Paper className={classes.root}>
              <Typography variant="h5" gutterBottom>
                Create New User
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Fill in the details below to generate a user YAML that can be added to your Backstage catalog.
              </Typography>
              
              <form onSubmit={handleSubmit} className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="name"
                      label="Username"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name || "Unique username for the user (letters, numbers, hyphens, underscores only)"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="displayName"
                      label="Display Name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.displayName}
                      helperText={errors.displayName || "Full name to display"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.email}
                      helperText={errors.email || "User's email address"}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="memberOf"
                      label="Member Of (Group)"
                      value={formData.memberOf}
                      onChange={handleInputChange}
                      fullWidth
                      error={!!errors.memberOf}
                      helperText={errors.memberOf || "Group the user should be a member of (optional)"}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submitButton}
                  fullWidth
                >
                  Generate User YAML
                </Button>
              </form>

              {generatedYaml && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Generated User YAML
                  </Typography>
                  <Box className={classes.yamlOutput}>
                    <IconButton
                      className={classes.copyButton}
                      onClick={handleCopyToClipboard}
                      size="small"
                      title="Copy to clipboard"
                    >
                      <FileCopyIcon />
                    </IconButton>
                    {generatedYaml}
                  </Box>
                </Box>
              )}

              {generatedYaml && (
                <Card className={classes.instructionsCard}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Instructions to Add User to Catalog
                    </Typography>
                    <Typography variant="body2" component="div">
                      <ol>
                        <li>
                          <strong>Copy the YAML above</strong> using the copy button
                        </li>
                        <li>
                          <strong>Open the file:</strong> <code>examples/org.yaml</code>
                        </li>
                        <li>
                          <strong>Add the YAML content</strong> at the end of the file
                        </li>
                        <li>
                          <strong>Save and commit</strong> the changes
                        </li>
                        <li>
                          <strong>Deploy your changes</strong> to the server
                        </li>
                        <li>
                          <strong>Refresh the catalog</strong> - the user should appear in a few minutes
                        </li>
                      </ol>
                      <Typography variant="body2" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                        Note: The user will be available at: <code>https://qortexone.qburst.build/catalog/default/user/{formData.name}</code>
                      </Typography>
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Content>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Page>
  );
};

export default CreateUserPage; 