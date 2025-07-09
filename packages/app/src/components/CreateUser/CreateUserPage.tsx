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
  CircularProgress,
} from '@material-ui/core';
import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { discoveryApiRef } from '@backstage/core-plugin-api';

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
  }),
);

const CreateUserPage = () => {
  const classes = useStyles();
  const discoveryApi = useApi(discoveryApiRef);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    displayName: '',
    email: '',
    memberOf: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = await discoveryApi.getBaseUrl('backend');
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create user');
      }

      // Success
      setSnackbar({
        open: true,
        message: 'User created successfully!',
        severity: 'success',
      });

      // Reset form
      setFormData({
        name: '',
        displayName: '',
        email: '',
        memberOf: '',
      });

    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to create user',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
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
          <Grid item xs={12} md={8} lg={6}>
            <Paper className={classes.root}>
              <Typography variant="h5" gutterBottom>
                Create New User
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Fill in the details below to create a new user in the system.
              </Typography>
              
              <form onSubmit={handleSubmit} className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Username"
                      value={formData.name}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name || "Unique username for the user (letters, numbers, hyphens, underscores only)"}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="displayName"
                      label="Display Name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      error={!!errors.displayName}
                      helperText={errors.displayName || "Full name to display"}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
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
                      disabled={isSubmitting}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="memberOf"
                      label="Member Of (Group)"
                      value={formData.memberOf}
                      onChange={handleInputChange}
                      fullWidth
                      error={!!errors.memberOf}
                      helperText={errors.memberOf || "Group the user should be a member of (optional)"}
                      disabled={isSubmitting}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submitButton}
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                >
                  {isSubmitting ? 'Creating User...' : 'Create User'}
                </Button>
              </form>
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