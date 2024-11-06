import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../../../components/container/PageContainer';
import GetAppIcon from '@mui/icons-material/GetApp';
import { addMaterialsData } from './AddMaterialsMockData';
import ParentCard from '../../../components/shared/ParentCard';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'materialCode', headerName: '자재코드', width: 200 },
  { field: 'pcs', headerName: '입고수량 (PCS)', width: 150 },
  { field: 'kg', headerName: '입고중량 (Kg)', width: 150 },
];

const Add = () => {
  return (
    <div>
      <PageContainer title="자재입고 등록">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="자재정보 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                  rows={addMaterialsData.table}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  pagination
                  checkboxSelection
                  rowHeight={30}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': {
                      height: 30,
                      backgroundColor: '#f0f0f0', // Header background color
                      color: '#333', // Header text color
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="primary"
                    aria-label="add"
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton color="warning" aria-label="delete" sx={{
                    border: '1px solid',
                    borderColor: 'warning.main',
                    borderRadius: 1,
                  }}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton color="primary" aria-label="save" sx={{
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                  }}>
                    <SaveIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </div>
  );
};

export default Add;