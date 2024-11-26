import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, IconButton, Stack, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';

const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'itemName', headerName: '품명', width: 150 },
    { field: 'systemCode', headerName: '사양코드', width: 150 }, // 수정된 부분
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
    const [data, setData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/item/standard');
            setData(response.data.table);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOpenModal = (row = {}) => {
        setCurrentRow(row);
        setIsEditing(!!row.id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentRow({});
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                // Update existing row
                await axios.put(`/api/item/standard/${currentRow.id}`, currentRow);
            } else {
                // Add new row
                await axios.post('/api/item/standard', currentRow);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/item/standard/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setCurrentRow({ ...currentRow, [field]: value });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <PageContainer title="규격품목 셋업">
                <Grid container spacing={2}>
                    <Grid item xs={12} mt={3}>
                        <ParentCard title="규격품목 입력 화면">
                            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                                <DataGrid
                                    rows={data}
                                    columns={columns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    pagination
                                    checkboxSelection
                                    rowHeight={30}
                                    onRowClick={(params) => handleOpenModal(params.row)}
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
                                    <IconButton
                                        color="primary"
                                        aria-label="add"
                                        onClick={() => handleOpenModal()}
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
                                    <IconButton
                                        color="warning"
                                        aria-label="delete"
                                        onClick={() => handleDelete(currentRow.id)}
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
                                        onClick={handleSave}
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

            {/* Modal */}
            <Dialog open={modalOpen} onClose={handleCloseModal}>
                <DialogTitle>{isEditing ? 'Edit Row' : 'Add Row'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="품명"
                        fullWidth
                        value={currentRow.itemName || ''}
                        onChange={(e) => handleInputChange('itemName', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="사양코드"
                        fullWidth
                        value={currentRow.systemCode || ''} // 수정된 부분
                        onChange={(e) => handleInputChange('systemCode', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="End-bar"
                        fullWidth
                        value={currentRow.endBar || ''}
                        onChange={(e) => handleInputChange('endBar', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="품목종류"
                        fullWidth
                        value={currentRow.itemType || ''}
                        onChange={(e) => handleInputChange('itemType', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="폭(mm)"
                        type="number"
                        fullWidth
                        value={currentRow.width || ''}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="길이(mm)"
                        type="number"
                        fullWidth
                        value={currentRow.length || ''}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="CB수"
                        type="number"
                        fullWidth
                        value={currentRow.cbCount || ''}
                        onChange={(e) => handleInputChange('cbCount', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="LEP(mm)"
                        type="number"
                        fullWidth
                        value={currentRow.lep || ''}
                        onChange={(e) => handleInputChange('lep', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="REP(mm)"
                        type="number"
                        fullWidth
                        value={currentRow.rep || ''}
                        onChange={(e) => handleInputChange('rep', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="중량(kg)"
                        type="number"
                        fullWidth
                        value={currentRow.weight || ''}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="NE중량(kg)"
                        type="number"
                        fullWidth
                        value={currentRow.neWeight || ''}
                        onChange={(e) => handleInputChange('neWeight', e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">
                        취소
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Items;
