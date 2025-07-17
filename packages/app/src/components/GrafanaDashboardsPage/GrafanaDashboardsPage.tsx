import React from 'react';
import { Grid, Card, CardContent, Typography, CardHeader } from '@material-ui/core';
import { Page, Header, Content, HeaderLabel } from '@backstage/core-components';
import { DashboardIcon } from '@material-ui/icons';

// Import Grafana components when configuration is ready
// import { GrafanaDashboardsCard } from '@backstage-community/plugin-grafana';

const PlaceholderDashboard = () => (
  <Card>
    <CardHeader 
      title="Platform Overview Dashboard" 
      avatar={<DashboardIcon />}
    />
    <CardContent>
      <Typography variant="body1">
        Configure your Grafana instance in app-config.yaml to see live dashboards here.
      </Typography>
      <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
        Once configured, this area will show:
        <br />• System-wide metrics
        <br />• Service health overview
        <br />• Infrastructure monitoring
        <br />• Custom business dashboards
      </Typography>
    </CardContent>
  </Card>
);

const QuickLinks = () => (
  <Card>
    <CardHeader title="Quick Actions" />
    <CardContent>
      <Typography variant="body2">
        • <a href="/metrics" style={{ textDecoration: 'none' }}>View Component Metrics</a>
        <br />
        • <a href="/catalog" style={{ textDecoration: 'none' }}>Browse Catalog</a>
        <br />
        • <a href="/create" style={{ textDecoration: 'none' }}>Create New Component</a>
      </Typography>
    </CardContent>
  </Card>
);

export const GrafanaDashboardsPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Monitoring Dashboards">
        <HeaderLabel label="Platform" value="Overview" />
      </Header>
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <PlaceholderDashboard />
          </Grid>
          <Grid item xs={12} md={4}>
            <QuickLinks />
          </Grid>
          
          {/* Uncomment when Grafana is configured */}
          {/*
          <Grid item xs={12} md={6}>
            <GrafanaDashboardsCard 
              title="System Overview"
              tags={['platform', 'overview']}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <GrafanaDashboardsCard 
              title="Application Metrics"
              tags={['applications', 'performance']}
            />
          </Grid>
          */}
        </Grid>
      </Content>
    </Page>
  );
}; 