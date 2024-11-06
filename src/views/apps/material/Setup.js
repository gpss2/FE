import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../../../components/container/PageContainer';

import { materialsData } from './SetupMaterialsMockData';

import ParentCard from '../../../components/shared/ParentCard';

const columnsLeft = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'materialCode', headerName: '자재코드', width: 150 },
    { field: 'materialType', headerName: '자재타입', width: 150 },
    { field: 'thickness', headerName: '자재길이 (mm)', width: 130 },
    { field: 'weight', headerName: '단중 (Kg/m)', width: 130 },
];

const columnsRight = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'systemCode', headerName: '사양 코드', width: 150 },
    { field: 'bbCode', headerName: 'BB코드', width: 150 },
    { field: 'cbCode', headerName: 'CB코드', width: 150 },
    { field: 'bWidth', headerName: 'B 피치 (mm)', width: 130 },
    { field: 'cWidth', headerName: 'C 피치 (mm)', width: 130 },
    { field: 'quantity', headerName: '물량 두께 (mm)', width: 130 },
];

const Setup = () => {
    return (
        <div>
            <PageContainer title="자재표준 셋업">
                <Grid container spacing={2}>
                    {/* Left Table */}
                    <Grid item lg={5} xs={12} mt={3}>
                        <ParentCard title="자재개요 입력 화면">
                            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                                <DataGrid
                                    rows={materialsData.leftTable}
                                    columns={columnsLeft}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
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
                                    <IconButton color="primary" aria-label="print"
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

                    {/* Right Table */}
                    <Grid item lg={7} xs={12} mt={3}>
                        <ParentCard title="제작사양 입력 화면">
                            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                                <DataGrid
                                    rows={materialsData.rightTable}
                                    columns={columnsRight}
                                    pageSize={5}
                                    checkboxSelection
                                    rowsPerPageOptions={[5, 10, 20]}
                                    pagination
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
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        color="warning"
                                        aria-label="delete"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'warning.main',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        aria-label="save"
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 1,
                                        }}
                                    >
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

export default Setup;