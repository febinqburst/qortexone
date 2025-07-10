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
} from '@material-ui/core';
import { Content, Header, Page } from '@backstage/core-components';

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
  }),
);

const CreateUserPage = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    email: '',
    memberOf: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Creating user:', formData);
    alert('User creation functionality would be implemented here. Check console for form data.');
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
                      helperText="Unique username for the user"
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
                      helperText="Full name to display"
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
                      helperText="User's email address"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="memberOf"
                      label="Member Of (Group)"
                      value={formData.memberOf}
                      onChange={handleInputChange}
                      fullWidth
                      helperText="Group the user should be a member of (optional)"
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
                  Create User
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default CreateUserPage; 