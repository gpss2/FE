import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../../../components/container/PageContainer';
import { itemMaterialsData } from './ItemMaterialsMockData';
import ParentCard from '../../../components/shared/ParentCard';

const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'itemName', headerName: '품명', width: 150 },
    { field: 'projectCode', headerName: '사업코드', width: 150 },
    { field: 'endBar', headerName: 'End-bar', width: 150 },
    { field: 'itemType', headerName: '품목종류', width: 100 },
    { field: 'width', headerName: '폭(mm)', width: 100 },
    { field: 'length', headerName: '길이(mm)', width: 100 },
    { field: 'cbCount', headerName: 'CB수', width: 70 },
    { field: 'lep', headerName: 'LEP(mm)', width: 100 },
    { field: 'rep', headerName: 'REP(mm)', width: 100 },
    { field: 'weight', headerName: '중량(kg)', width: 100 },
    { field: 'neWeight', headerName: 'NE중량(kg)', width: 100 },
];

const Items = () => {
    return (
        <div>
        <PageContainer title="규격품목 셋업">
            <Grid container spacing={2}>
                <Grid item xs={12} mt={3}>
                    <ParentCard title="규격품목 입력 화면">
                        <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                            <DataGrid
                                rows={itemMaterialsData.table}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 20, 30]}
                                pagination
                                checkboxSelection
                                rowHeight={30}
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': {
                                        height: 30,
                                        backgroundColor: '#f0f0f0',
                                        color: '#333',
                                    },
                                }}
                            />
                        </Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                            <Stack direction="row" spacing={1}>
                                <IconButton color="primary" aria-label="download-csv"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: 1,
                                    }}>
                                    <PrintIcon />
                                </IconButton>
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
        </div >
    );
};

export default Items; 