import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import NoteSidebar from '../../../components/apps/notes/NoteSidebar';
import NoteContent from '../../../components/apps/notes/NoteContent';
import AppCard from 'src/components/shared/AppCard';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Notes',
  },
];

const Notes = () => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  useEffect(() => {
    if (lgDown) {
      setMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setMobileSidebarOpen(true);
    }
  }, [lgDown]);

  return (
    <PageContainer title="Notes ui" description="this is Note page">
      <Breadcrumb title="Note app" items={BCrumb} />
      <AppCard>
        {/* ------------------------------------------- */}
        {/* Left part */}
        {/* ------------------------------------------- */}

        {isMobileSidebarOpen ? (
          <NoteSidebar
            isMobileSidebarOpen={isMobileSidebarOpen}
            onSidebarClose={() => setMobileSidebarOpen(false)}
          />
        ) : (
          ''
        )}
        {/* ------------------------------------------- */}
        {/* Right part */}
        {/* ------------------------------------------- */}

        <Box flexGrow={1}>
          <NoteContent toggleNoteSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)} />
        </Box>
      </AppCard>
    </PageContainer>
  );
};

export default Notes;
