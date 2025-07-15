import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
} from '@material-ui/core';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  TrendingUp as TrendingUpIcon,
  Apps as AppsIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
} from '@material-ui/icons';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

interface ComponentMetrics {
  totalComponents: number;
  componentsByType: { name: string; count: number; color: string }[];
  componentsByOwner: { name: string; count: number }[];
  componentsByLifecycle: { name: string; count: number; color: string }[];
  recentComponents: { name: string; date: string; type: string }[];
  healthStatus: { healthy: number; warning: number; critical: number };
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },
    metricCard: {
      padding: theme.spacing(2),
      textAlign: 'center',
      height: '140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    metricValue: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: theme.spacing(1),
    },
    metricTitle: {
      fontSize: '0.875rem',
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    metricIcon: {
      fontSize: '2rem',
      marginBottom: theme.spacing(1),
      opacity: 0.7,
    },
    chartContainer: {
      padding: theme.spacing(2),
      height: '300px',
    },
    chartTitle: {
      marginBottom: theme.spacing(2),
      fontWeight: 'bold',
    },
    recentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(1),
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:last-child': {
        borderBottom: 'none',
      },
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    },
  }),
);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
const TYPE_COLORS: { [key: string]: string } = {
  'service': '#4caf50',
  'website': '#2196f3',
  'library': '#ff9800',
  'api': '#9c27b0',
  'component': '#607d8b',
  'system': '#795548',
};

const LIFECYCLE_COLORS: { [key: string]: string } = {
  'production': '#4caf50',
  'experimental': '#ff9800',
  'deprecated': '#f44336',
  'development': '#2196f3',
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle }) => {
  const classes = useStyles();
  
  return (
    <Paper className={classes.metricCard} style={{ borderTop: `4px solid ${color || '#2196f3'}` }}>
      <Box className={classes.metricIcon} style={{ color: color || '#2196f3' }}>
        {icon}
      </Box>
      <Typography className={classes.metricValue} style={{ color: color || '#2196f3' }}>
        {value}
      </Typography>
      <Typography className={classes.metricTitle}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

const MetricsDashboard = () => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [metrics, setMetrics] = useState<ComponentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch all entities from catalog
        const entities = await catalogApi.getEntities({
          filter: {
            kind: ['Component', 'API', 'System', 'Resource'],
          },
        });

        const components = entities.items;
        
        // Calculate metrics
        const totalComponents = components.length;
        
        // Components by type
        const typeCount: { [key: string]: number } = {};
        components.forEach(component => {
          const type = component.spec?.type as string || 'component';
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        const componentsByType = Object.entries(typeCount).map(([name, count]) => ({
          name,
          count,
          color: TYPE_COLORS[name.toLowerCase()] || '#607d8b',
        }));

        // Components by owner
        const ownerCount: { [key: string]: number } = {};
        components.forEach(component => {
          const owner = component.spec?.owner as string || 'unassigned';
          ownerCount[owner] = (ownerCount[owner] || 0) + 1;
        });
        
        const componentsByOwner = Object.entries(ownerCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10 owners

        // Components by lifecycle
        const lifecycleCount: { [key: string]: number } = {};
        components.forEach(component => {
          const lifecycle = component.spec?.lifecycle as string || 'unknown';
          lifecycleCount[lifecycle] = (lifecycleCount[lifecycle] || 0) + 1;
        });
        
        const componentsByLifecycle = Object.entries(lifecycleCount).map(([name, count]) => ({
          name,
          count,
          color: LIFECYCLE_COLORS[name.toLowerCase()] || '#607d8b',
        }));

        // Recent components (mock data - in real implementation, you'd track creation dates)
        const recentComponents = components
          .slice(0, 5)
          .map(component => ({
            name: component.metadata.name,
            date: 'Recently added',
            type: component.spec?.type as string || 'component',
          }));

        // Health status (mock data - in real implementation, you'd integrate with monitoring)
        const healthStatus = {
          healthy: Math.floor(totalComponents * 0.7),
          warning: Math.floor(totalComponents * 0.2),
          critical: Math.floor(totalComponents * 0.1),
        };

        setMetrics({
          totalComponents,
          componentsByType,
          componentsByOwner,
          componentsByLifecycle,
          recentComponents,
          healthStatus,
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [catalogApi]);

  if (loading) {
    return (
      <Page themeId="home">
        <Header title="Component Metrics Dashboard" />
        <Content>
          <Box className={classes.loadingContainer}>
            <Box>
              <LinearProgress />
              <Typography variant="h6" style={{ marginTop: '1rem' }}>
                Loading metrics...
              </Typography>
            </Box>
          </Box>
        </Content>
      </Page>
    );
  }

  if (error || !metrics) {
    return (
      <Page themeId="home">
        <Header title="Component Metrics Dashboard" />
        <Content>
          <Typography variant="h6" color="error">
            {error || 'No metrics data available'}
          </Typography>
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="home">
      <Header title="Component Metrics Dashboard" />
      <Content>
        <Grid container spacing={3}>
          {/* Metric Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Components"
              value={metrics.totalComponents}
              icon={<AppsIcon />}
              color="#2196f3"
              subtitle="Across all systems"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Component Types"
              value={metrics.componentsByType.length}
              icon={<TimelineIcon />}
              color="#4caf50"
              subtitle="Different categories"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Teams/Owners"
              value={metrics.componentsByOwner.length}
              icon={<GroupIcon />}
              color="#ff9800"
              subtitle="Active contributors"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Healthy Components"
              value={`${Math.round((metrics.healthStatus.healthy / metrics.totalComponents) * 100)}%`}
              icon={<TrendingUpIcon />}
              color="#4caf50"
              subtitle={`${metrics.healthStatus.healthy} of ${metrics.totalComponents}`}
            />
          </Grid>

          {/* Components by Type Chart */}
          <Grid item xs={12} md={6}>
            <Paper className={classes.chartContainer}>
              <Typography variant="h6" className={classes.chartTitle}>
                Components by Type
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={metrics.componentsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.componentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Components by Lifecycle Chart */}
          <Grid item xs={12} md={6}>
            <Paper className={classes.chartContainer}>
              <Typography variant="h6" className={classes.chartTitle}>
                Components by Lifecycle
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={metrics.componentsByLifecycle}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8">
                    {metrics.componentsByLifecycle.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Components by Owner Chart */}
          <Grid item xs={12} md={8}>
            <Paper className={classes.chartContainer}>
              <Typography variant="h6" className={classes.chartTitle}>
                Top Component Owners
              </Typography>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={metrics.componentsByOwner}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Components */}
          <Grid item xs={12} md={4}>
            <Paper className={classes.root}>
              <Typography variant="h6" className={classes.chartTitle}>
                Recent Components
              </Typography>
              {metrics.recentComponents.map((component, index) => (
                <Box key={index} className={classes.recentItem}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {component.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {component.date}
                    </Typography>
                  </Box>
                  <Chip
                    label={component.type}
                    size="small"
                    style={{
                      backgroundColor: TYPE_COLORS[component.type.toLowerCase()] || '#607d8b',
                      color: 'white',
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Health Status */}
          <Grid item xs={12}>
            <Paper className={classes.root}>
              <Typography variant="h6" className={classes.chartTitle}>
                Component Health Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" style={{ color: '#4caf50' }}>
                      {metrics.healthStatus.healthy}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Healthy Components
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" style={{ color: '#ff9800' }}>
                      {metrics.healthStatus.warning}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Warning Components
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" style={{ color: '#f44336' }}>
                      {metrics.healthStatus.critical}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Critical Components
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default MetricsDashboard; 