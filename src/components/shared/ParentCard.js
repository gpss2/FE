import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Divider, Box } from '@mui/material';
import { useSelector } from 'react-redux';

const ParentCard = ({ title, children, footer }) => {
  const customizer = useSelector((state) => state.customizer);
  return (
    <Card
      sx={{ padding: 0 }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? 'outlined' : undefined}
    >
      <CardHeader title={<Box sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{title}</Box>} />
      <Divider />

      <CardContent sx={{ paddingTop: '0px' }}>{children}</CardContent>
      {footer ? (
        <>
          <Divider />
          <Box p={1}>{footer}</Box>
        </>
      ) : null}
    </Card>
  );
};

ParentCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  footer: PropTypes.node,
};

export default ParentCard;
