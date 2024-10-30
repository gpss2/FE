import React from 'react';
import { Grid } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import ProfileBanner from 'src/components/apps/userprofile/profile/ProfileBanner';
import FollowerCard from 'src/components/apps/userprofile/followers/FollowerCard';

const Followers = () => {
  return (
    <PageContainer title="User Profile" description="this is User Profile page">
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <ProfileBanner />
        </Grid>
        <Grid item sm={12}>
          <FollowerCard />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Followers;
