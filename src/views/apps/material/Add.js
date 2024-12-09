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
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'materialCode', headerName: '자재코드', width: 200 },
    { field: 'pcs', headerName: '입고수량 (PCS)', width: 150 },
    { field: 'kg', headerName: '입고중량 (Kg)', width: 150 },
];

const Add = () => {
    const [data, setData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/item/store');
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
                await axios.put(`/api/item/store/${currentRow.id}`, currentRow);
            } else {
                // Add new row
                await axios.post('/api/item/store', currentRow);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/item/store/${id}`);
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
            <PageContainer title="자재입고 등록">
                <Grid container spacing={2}>
                    <Grid item xs={12} mt={3}>
                        <ParentCard title="자재정보 입력 화면">
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
                                            height: 60,
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
                        label="자재코드"
                        fullWidth
                        value={currentRow.materialCode || ''}
                        onChange={(e) => handleInputChange('materialCode', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="입고수량 (PCS)"
                        type="number"
                        fullWidth
                        value={currentRow.pcs || ''}
                        onChange={(e) => handleInputChange('pcs', e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="입고중량 (Kg)"
                        type="number"
                        fullWidth
                        value={currentRow.kg || ''}
                        onChange={(e) => handleInputChange('kg', e.target.value)}
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

export default Add;
