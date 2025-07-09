import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 30,
  },
  text: {
    fill: '#7df3e1',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
  },
});

const LogoFull = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 30"
    >
      <text x="10" y="22" className={classes.text}>
        QortexOne
      </text>
    </svg>
  );
};

export default LogoFull;
