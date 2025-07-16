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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { Content, Header, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import {
  TrendingUp as TrendingUpIcon,
  Apps as AppsIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
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
  componentsByType: { name: string; count: number; percentage: number }[];
  componentsByOwner: { name: string; count: number }[];
  componentsByLifecycle: { name: string; count: number; percentage: number }[];
  recentComponents: { name: string; type: string; owner: string }[];
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
      height: '180px',
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
    section: {
      padding: theme.spacing(2),
    },
    sectionTitle: {
      marginBottom: theme.spacing(2),
      fontWeight: 'bold',
    },
    progressBar: {
      height: '10px',
      borderRadius: '5px',
      marginBottom: theme.spacing(1),
    },
    progressItem: {
      marginBottom: theme.spacing(2),
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    },
    healthGrid: {
      textAlign: 'center',
    },
    healthIcon: {
      fontSize: '3rem',
      marginBottom: theme.spacing(1),
    },
  }),
);

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

const ProgressChart: React.FC<{ 
  data: { name: string; count: number; percentage: number }[];
  title: string;
}> = ({ data, title }) => {
  const classes = useStyles();
  
  return (
    <Paper className={classes.section}>
      <Typography variant="h6" className={classes.sectionTitle}>
        {title}
      </Typography>
      {data.map((item, index) => (
        <Box key={index} className={classes.progressItem}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">
              {item.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {item.count} ({item.percentage.toFixed(1)}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={item.percentage}
            className={classes.progressBar}
            style={{
              backgroundColor: '#e0e0e0',
            }}
          />
        </Box>
      ))}
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
          percentage: (count / totalComponents) * 100,
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
          percentage: (count / totalComponents) * 100,
        }));

        // Recent components
        const recentComponents = components
          .slice(0, 5)
          .map(component => ({
            name: component.metadata.name,
            type: component.spec?.type as string || 'component',
            owner: component.spec?.owner as string || 'unassigned',
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

          {/* Components by Type */}
          <Grid item xs={12} md={6}>
            <ProgressChart
              data={metrics.componentsByType}
              title="Components by Type"
            />
          </Grid>

          {/* Components by Lifecycle */}
          <Grid item xs={12} md={6}>
            <ProgressChart
              data={metrics.componentsByLifecycle}
              title="Components by Lifecycle"
            />
          </Grid>

          {/* Top Component Owners */}
          <Grid item xs={12} md={8}>
            <Paper className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Top Component Owners
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Owner/Team</TableCell>
                      <TableCell align="right">Components</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.componentsByOwner.map((owner, index) => (
                      <TableRow key={index}>
                        <TableCell>{owner.name}</TableCell>
                        <TableCell align="right">{owner.count}</TableCell>
                        <TableCell align="right">
                          {((owner.count / metrics.totalComponents) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recent Components */}
          <Grid item xs={12} md={4}>
            <Paper className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Recent Components
              </Typography>
              <List>
                {metrics.recentComponents.map((component, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AppsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={component.name}
                      secondary={`${component.type} • ${component.owner}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Health Status */}
          <Grid item xs={12}>
            <Paper className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Component Health Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} className={classes.healthGrid}>
                  <CheckCircleIcon className={classes.healthIcon} style={{ color: '#4caf50' }} />
                  <Typography variant="h4" style={{ color: '#4caf50' }}>
                    {metrics.healthStatus.healthy}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Healthy Components
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} className={classes.healthGrid}>
                  <WarningIcon className={classes.healthIcon} style={{ color: '#ff9800' }} />
                  <Typography variant="h4" style={{ color: '#ff9800' }}>
                    {metrics.healthStatus.warning}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Warning Components
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} className={classes.healthGrid}>
                  <ErrorIcon className={classes.healthIcon} style={{ color: '#f44336' }} />
                  <Typography variant="h4" style={{ color: '#f44336' }}>
                    {metrics.healthStatus.critical}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Critical Components
                  </Typography>
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