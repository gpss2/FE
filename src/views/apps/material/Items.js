import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Stack,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import ItemDataGrid from './ItemDataGrid';

// axios interceptor settings
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

// Index column (displays row number starting from 1)
const indexColumn = {
  field: 'index',
  headerName: '',
  width: 40,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  cellClassName: 'index-cell',
  renderCell: (params) => {
    const sortedRowIds = params.api.getSortedRowIds();
    return sortedRowIds.indexOf(params.id) + 1;
  },
};

// Grid columns definition for Items
const columns = [
  indexColumn,
  { field: 'itemName', headerName: '품명', flex: 1, editable: true },
  { field: 'systemCode', headerName: '사양코드', flex: 1, editable: true },
  { field: 'endBar', headerName: 'End-bar', flex: 1, editable: true },
  { field: 'itemType', headerName: '품목종류', flex: 1, editable: true },
  { field: 'width', headerName: '폭(mm)', flex: 1, editable: true },
  { field: 'length', headerName: '길이(mm)', flex: 1, editable: true },
  { field: 'cbCount', headerName: 'CB수', flex: 1, editable: true },
  { field: 'lep', headerName: 'LEP(mm)', flex: 1, editable: true },
  { field: 'rep', headerName: 'REP(mm)', flex: 1, editable: true },
  { field: 'weight', headerName: '중량(kg)', flex: 1, editable: true },
  { field: 'neWeight', headerName: 'NE중량(kg)', flex: 1, editable: true },
];

// Item type selection options
const itemTypeOptions = ['R', 'C', 'Angle 대', 'Angle 소', 'EndBar', 'GB', '각 Pipe', '특수 Type'];

// Helper function to find material info
function findMaterial(materialCode, materialsState) {
  return materialsState.find((m) => m.materialCode === materialCode);
}

/**
 * Frontend weight calculation (referenced from backend logic)
 * @param {Object} row - Grid row data
 * @param {Array} materialsState - Material information
 * @param {Array} specCodeState - Specification information
 * @returns {{ totalWeight: number, neWeight: number }} Calculated weights
 */
function calculateGratingWeightsFrontEnd(row, materialsState, specCodeState) {
  const width = parseFloat(row.width) || 0;
  const length = parseFloat(row.length) || 0;
  const cb_count = parseInt(row.cbCount) || 0;
  const endBarCode = row.endBar || '';
  const systemCode = row.systemCode || '';

  const specItem = specCodeState.find((s) => s.systemCode === systemCode);
  if (!specItem || !specItem.bbCode || !specItem.cbCode) {
    return { totalWeight: 0, neWeight: 0 };
  }

  const bb_material = findMaterial(specItem.bbCode, materialsState);
  const cb_material = findMaterial(specItem.cbCode, materialsState);
  const eb_material = findMaterial(endBarCode, materialsState);

  if (!bb_material || !cb_material || !eb_material) {
    return { totalWeight: 0, neWeight: 0 };
  }

  const b_pitch = parseFloat(specItem.bWidth) || 30; // Use bWidth from spec or default
  const bb_count = Math.floor(width / b_pitch) || 1;
  const eb_thickness = parseFloat(eb_material.maxWidth) || 0;

  const bb_length = (length - eb_thickness * 2) / 1000;
  const bb_weight = bb_length * (bb_material.weight || 0) * bb_count;

  const cb_length = width / 1000;
  const cb_weight = cb_length * (cb_material.weight || 0) * cb_count;

  const eb_length = width / 1000;
  const eb_weight = eb_length * (eb_material.weight || 0) * 2;

  let total_weight = bb_weight + cb_weight + eb_weight;
  let ne_weight = total_weight - eb_weight;

  total_weight = Math.round(total_weight * 10) / 10;
  ne_weight = Math.round(ne_weight * 10) / 10;

  return { totalWeight: total_weight, neWeight: ne_weight };
}

const Items = () => {
  const [data, setData] = useState([]);
  const [specCodes, setSpecCodes] = useState([]);
  const [materials, setMaterials] = useState([]); // Changed from endBars to materials
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const navigate = useNavigate();
  const [tempIdCounter, setTempIdCounter] = useState(-1);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchData();
    fetchSpecCodes();
    fetchMaterials(); // Changed from fetchEndBars
  }, [navigate]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/item/standard');
      setData(response.data.table);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchSpecCodes = async () => {
    try {
      const response = await axios.get('/api/item/specific');
      setSpecCodes(response.data.table);
    } catch (error) {
      console.error('Error fetching spec codes:', error);
    }
  };

  const fetchMaterials = async () => {
    // Changed from fetchEndBars
    try {
      const response = await axios.get('/api/item/material');
      setMaterials(response.data.table); // Changed from setEndBars
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const recalcValues = (newData, oldData, C_PITCH) => {
    let source = '';
    if (newData.length !== oldData.length) source = 'length';
    else if (newData.cbCount !== oldData.cbCount) source = 'cbCount';
    else if (newData.lep !== oldData.lep) source = 'lep';
    else if (newData.rep !== oldData.rep) source = 'rep';
    else return { ...oldData, ...newData };

    let length, cbCount, lep, rep;
    let errorFlag = false;
    const roundToOne = (value) => Math.round(value * 10) / 10;

    if (source === 'length') {
      length = roundToOne(Number(newData.length));
      cbCount = Math.floor(length / C_PITCH) + 1;
      let total = length - (cbCount - 1) * C_PITCH;
      lep = total / 2;
      rep = total / 2;
      while ((lep < 40 || rep < 40) && cbCount > 1) {
        cbCount--;
        total = length - (cbCount - 1) * C_PITCH;
        lep = total / 2;
        rep = total / 2;
      }
      if (total >= 200) errorFlag = true;
      lep = roundToOne(lep);
      rep = roundToOne(rep);
    } else if (source === 'cbCount') {
      length = roundToOne(Number(oldData.length));
      cbCount = Number(newData.cbCount);
      let total = length - (cbCount - 1) * C_PITCH;
      lep = total / 2;
      rep = total / 2;
      if (total >= 200) errorFlag = true;
      lep = roundToOne(lep);
      rep = roundToOne(rep);
    } else if (source === 'lep') {
      length = roundToOne(Number(oldData.length));
      cbCount = Number(oldData.cbCount);
      let total = length - (cbCount - 1) * C_PITCH;
      let newLep = roundToOne(Number(newData.lep));
      let newRep = total - newLep;
      if (newLep > C_PITCH || newLep > total) {
        cbCount -= 1;
        total = length - (cbCount - 1) * C_PITCH;
        newRep = total - newLep;
      }
      if (newRep > C_PITCH || newRep > total) {
        cbCount += 1;
        total = length - (cbCount - 1) * C_PITCH;
        newRep = total - newLep;
      }
      if (total >= 200) errorFlag = true;
      lep = newLep;
      rep = roundToOne(newRep);
    } else if (source === 'rep') {
      length = roundToOne(Number(oldData.length));
      cbCount = Number(oldData.cbCount);
      let total = length - (cbCount - 1) * C_PITCH;
      let newRep = roundToOne(Number(newData.rep));
      let newLep = total - newRep;
      if (newRep > C_PITCH || newRep > total) {
        cbCount -= 1;
        total = length - (cbCount - 1) * C_PITCH;
        newLep = total - newRep;
      }
      if (newLep > C_PITCH || newLep > total) {
        cbCount += 1;
        total = length - (cbCount - 1) * C_PITCH;
        newLep = total - newRep;
      }
      if (total >= 200) errorFlag = true;
      rep = newRep;
      lep = roundToOne(newLep);
    }

    return {
      ...newData,
      length: roundToOne(length),
      cbCount: cbCount,
      lep: lep,
      rep: rep,
      error: errorFlag,
    };
  };

  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;

    // 1. Recalculate LEP/REP/CB Count
    const currentSpec = specCodes.find((item) => item.systemCode === newRow.systemCode);
    const C_PITCH = currentSpec ? currentSpec.cWidth : 100;
    const recalculatedRow = recalcValues(newRow, oldRow, C_PITCH);

    // 2. Calculate weights
    const { totalWeight, neWeight } = calculateGratingWeightsFrontEnd(
      recalculatedRow,
      materials,
      specCodes,
    );

    // 3. Combine results into the final row object
    const finalRow = {
      ...recalculatedRow,
      weight: totalWeight,
      neWeight: neWeight,
      __error__: recalculatedRow.error, // Pass error flag to the grid
    };

    setPendingUpdates((prev) => ({ ...prev, [finalRow.id]: finalRow }));
    return finalRow;
  };

  const handleAddRow = () => {
    const newRow = {
      id: tempIdCounter,
      itemName: '',
      systemCode: '',
      endBar: '',
      itemType: 'R',
      width: '',
      length: '',
      cbCount: '',
      lep: '',
      rep: '',
      weight: '',
      neWeight: '',
      isNew: true,
    };
    setData((prev) => [...prev, newRow]);
    setTempIdCounter((prev) => prev - 1);
  };

  const handleBulkSave = async () => {
    setApplyLoading(true);
    const invalidMessages = [];
    data.forEach((row, index) => {
      const requiredFields = ['itemName', 'systemCode', 'endBar', 'itemType'];
      requiredFields.forEach((field) => {
        if (!row[field] || row[field].toString().trim() === '') {
          invalidMessages.push(`Index ${index + 1}: Missing value for ${field}.`);
        }
      });
    });

    if (invalidMessages.length > 0) {
      alert(invalidMessages.join('\n'));
      setApplyLoading(false);
      return;
    }

    try {
      const updates = Object.values(pendingUpdates);
      const updatePromises = updates.map((row) => {
        const { __error__, ...payload } = row;
        if (row.id < 0) {
          const { id, isNew, ...newRowData } = payload;
          return axios.post('/api/item/standard', newRowData);
        } else {
          return axios.put(`/api/item/standard/${row.id}`, payload);
        }
      });
      await Promise.all(updatePromises);
      await fetchData();
      setPendingUpdates({});
      alert('Changes applied successfully.');
    } catch (error) {
      console.error('Error saving updates:', error);
      alert('Failed to save changes.');
    }
    setApplyLoading(false);
  };

  const handleDelete = async () => {
    if (selectedItemId === null) return;

    if (selectedItemId < 0) {
      setData((prevData) => prevData.filter((row) => row.id !== selectedItemId));
      setPendingUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[selectedItemId];
        return newUpdates;
      });
      setSelectedItemId(null);
      return;
    }

    try {
      await axios.delete(`/api/item/standard/${selectedItemId}`);
      await fetchData();
      setSelectedItemId(null);
      alert('Item deleted successfully.');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };

  const handleCellDoubleClick = (params) => {
    if (['systemCode', 'endBar', 'itemType'].includes(params.field)) {
      setModalData(params.row);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalData(null);
  };

  const handleSaveModal = () => {
    if (modalData) {
      // When modal values change, we need to re-run the full calculation
      const updatedRow = handleProcessRowUpdate(modalData, data.find(d => d.id === modalData.id));
      setData((prev) => prev.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
      // The update is already added to pendingUpdates by handleProcessRowUpdate
    }
    handleModalClose();
  };

  const handleRowUpdate = (updatedRow) => {
    setData((prevData) => prevData.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
  };

  return (
    <div>
      <PageContainer title="규격품목 셋업">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="규격품목 입력 화면">
              <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <ItemDataGrid
                  rows={data}
                  columns={columns}
                  processRowUpdate={handleProcessRowUpdate}
                  onRowUpdate={handleRowUpdate}
                  getRowId={(row) => row.id}
                  onRowClick={(params) => setSelectedItemId(params.id)}
                  modalEditFields={['systemCode', 'endBar', 'itemType']}
                  onCellDoubleClick={handleCellDoubleClick}
                  getRowClassName={(params) => (params.row.__error__ ? 'error-cell' : '')}
                  columnHeaderHeight={30}
                  rowHeight={25}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '12px',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '14px',
                      backgroundColor: '#B2B2B2',
                      border: '1px solid black',
                    },
                    '& .error-cell': { backgroundColor: 'red', color: 'white' },
                    '& .index-cell': { backgroundColor: '#B2B2B2' },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" mb={1} spacing={2} mt={2}>
                <Button
                  variant="contained"
                  onClick={handleBulkSave}
                  disabled={Object.keys(pendingUpdates).length === 0 || applyLoading}
                >
                  {applyLoading ? <CircularProgress size={24} color="inherit" /> : '적용'}
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRow}>
                  추가
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={selectedItemId === null}
                >
                  삭제
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      {isModalOpen && modalData && (
        <Dialog open={isModalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
          <DialogTitle>값 선택</DialogTitle>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              <SearchableSelect
                label="사양코드"
                options={specCodes.map((row) => row.systemCode)} // Provide simple array of strings
                value={modalData.systemCode || ''}
                onChange={(e) => setModalData((prev) => ({ ...prev, systemCode: e.target.value }))}
              />
              <SearchableSelect
                label="End-bar"
                options={materials.map((row) => row.materialCode)}
                value={modalData.endBar || ''}
                onChange={(e) => setModalData((prev) => ({ ...prev, endBar: e.target.value }))}
              />
              <SearchableSelect
                label="품목종류"
                options={itemTypeOptions}
                value={modalData.itemType || ''}
                onChange={(e) => setModalData((prev) => ({ ...prev, itemType: e.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} color="secondary">
              취소
            </Button>
            <Button onClick={handleSaveModal} color="primary">
              저장
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Items;