import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 28,
  },
  text: {
    fill: '#7df3e1',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  },
  qText: {
    fill: '#ff0000',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  },
});

const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 28"
    >
      <text x="10" y="20" className={classes.qText}>
        Q
      </text>
      <text x="26" y="20" className={classes.text}>
        O
      </text>
    </svg>
  );
};

export default LogoIcon;
