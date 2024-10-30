import React, { useState } from 'react';
import { Button, Box, Drawer, useMediaQuery } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import EmailLists from '../../../components/apps/email/EmailList';
import EmailFilter from '../../../components/apps/email/EmailFilter';
import EmailSearch from '../../../components/apps/email/EmailSearch';
import EmailContent from '../../../components/apps/email/EmailContent';
import PageContainer from '../../../components/container/PageContainer';
import AppCard from 'src/components/shared/AppCard';
import breadcrumbImg from 'src/assets/images/breadcrumb/emailSv.png';

const drawerWidth = 240;
const secdrawerWidth = 320;

const Email = () => {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));
  return (
    <PageContainer title="Email App" description="this is email page">
      <Breadcrumb title="Email app" subtitle="Look at Inbox">
        <Box>
          <img src={breadcrumbImg} alt={breadcrumbImg} width={'165px'} />
        </Box>
      </Breadcrumb>

      <AppCard>
        {/* ------------------------------------------- */}
        {/* Left part */}
        {/* ------------------------------------------- */}

        <Drawer
          open={isLeftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          sx={{
            width: drawerWidth,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, position: 'relative', zIndex: 2 },
            flexShrink: 0,
          }}
          variant={lgUp ? 'permanent' : 'temporary'}
        >
          <EmailFilter />
        </Drawer>

        {/* ------------------------------------------- */}
        {/* Middle part */}
        {/* ------------------------------------------- */}

        <Box
          sx={{
            minWidth: secdrawerWidth,
            width: { xs: '100%', md: secdrawerWidth, lg: secdrawerWidth },
            flexShrink: 0,
          }}
        >
          <EmailSearch onClick={() => setLeftSidebarOpen(true)} />

          <EmailLists showrightSidebar={() => setRightSidebarOpen(true)} />
        </Box>

        {/* ------------------------------------------- */}
        {/* Right part */}
        {/* ------------------------------------------- */}

        {mdUp ? (
          <Drawer
            anchor="right"
            variant="permanent"
            sx={{
              zIndex: 0,
              width: '200px',
              flex: '1 1 auto',
              [`& .MuiDrawer-paper`]: { position: 'relative' },
            }}
          >
            <Box>
              <EmailContent />
            </Box>
          </Drawer>
        ) : (
          <Drawer
            anchor="right"
            open={isRightSidebarOpen}
            onClose={() => setRightSidebarOpen(false)}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: '85%' },
            }}
            variant="temporary"
          >
            <Box>
              <Box pl={3} pt={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setRightSidebarOpen(false)}
                  sx={{ display: { xs: 'block', md: 'none', lg: 'none' } }}
                >
                  {' '}
                  Back{' '}
                </Button>
              </Box>
              <EmailContent />
            </Box>
          </Drawer>
        )}
      </AppCard>
    </PageContainer>
  );
};

export default Email;
