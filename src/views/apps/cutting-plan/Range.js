import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Box, Grid, Stack, Button } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import { width } from '@mui/system';
import RangeDataGrid from './RangeDataGrid';

const indexColumn = {
  field: 'index',
  headerName: '',
  width: 20,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  cellClassName: 'index-cell',
  renderCell: (params) => {
    const sortedRowIds = params.api.getSortedRowIds();
    return sortedRowIds.indexOf(params.id) + 1;
  },
};
// 상단 테이블 컬럼 정의
const topColumns = [
  indexColumn,
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'customerCode', headerName: '수주처명', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
];

// 하단 테이블 컬럼 정의
const bottomColumns = [
  indexColumn,
  { field: 'drawingNumber', headerName: '도면\n번호', width: 60 },
  { field: 'itemNo', headerName: '품목 번호', width: 60 },
  { field: 'itemType', headerName: '품목\n종류', width: 60 },
  { field: 'itemName', headerName: '품명', width: 60 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'EndBar', flex: 1 },
  { field: 'width_mm', headerName: '폭', width: 60 },
  { field: 'length_mm', headerName: '길이', width: 60 },
  { field: 'cbCount', headerName: 'CB 수', width: 60 },
  { field: 'lep_mm', headerName: 'LEP', width: 60 },
  { field: 'rep_mm', headerName: 'REP', width: 60 },
  { field: 'quantity', headerName: '수량', width: 60 },
  { field: 'weight_kg', headerName: '중량', width: 60 },
  { field: 'groupNumber', headerName: '그룹번호', width: 160 },
];

const Range = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  // 그룹번호를 기준으로 선택되므로 selectedDrawings 상태는 제거하거나 사용하지 않아도 됩니다.
  const [selectOrderId, setSelectOrderId] = useState(null);
  const [selectGroupId, setSelectGroupId] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);

  const navigate = useNavigate();
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

  // 페이지 로드시 상단 테이블 데이터 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchTopData();
  }, [navigate]);

  const fetchTopData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      const processedData = response.data.table.map((row) => ({
        ...row,
        // 날짜 문자열에서 'T' 이전까지만 잘라쓰기
        deliveryDate: row.deliveryDate.split('T')[0],
      }));
      setTopData(processedData);
    } catch (error) {
      console.error('Error fetching top data:', error);
    }
  };

  const fetchBottomData = async (orderId) => {
    try {
      const response = await axios.get(`/api/plan/order-details/${orderId}`);
      setBottomData(response.data.table);
    } catch (error) {
      console.error('Error fetching bottom data:', error);
    }
  };

  // 상단 테이블에서 행 클릭 시 -> 해당 orderId로 하단 데이터 로드
  const handleRowClick = (params) => {
    const selectedOrderId = params.id;
    setSelectOrderId(selectedOrderId);
    // 행 클릭 시 선택 초기화
    setSelectGroupId(null);
    setSelectionModel([]);
    fetchBottomData(selectedOrderId);
  };

  // 하단 테이블에서 셀 클릭 시 -> 그룹번호(없으면 도면번호)를 기준으로 해당 그룹에 속한 모든 행 선택
  const handleCellClick = (params) => {
    const clickedRow = params.row;
    // 그룹번호가 null이면 도면번호를 대체값으로 사용
    const groupIdentifier =
      clickedRow.groupNumber !== null ? clickedRow.groupNumber : clickedRow.drawingNumber;
    setSelectGroupId(groupIdentifier);

    const sameRows = bottomData
      .filter((row) => {
        const identifier = row.groupNumber !== null ? row.groupNumber : row.drawingNumber;
        return identifier === groupIdentifier;
      })
      .map((row) => row.id);

    setSelectionModel((prevSelection) => {
      const newSet = new Set(prevSelection);
      sameRows.forEach((id) => {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      });
      return Array.from(newSet);
    });
  };

  // selectionModel 변경 핸들러
  const handleSelectionModelChange = (newSelection) => {
    setSelectionModel(newSelection);
  };

  // 병합: 선택된 그룹번호에 해당하는 모든 도면번호를 중복제거하여 payload로 전송
  const handleMerge = async () => {
    if (selectionModel.length === 0) {
      console.error('선택된 도면이 없습니다.');
      return;
    }
    // 선택된 행들에서 도면번호 추출
    const selectedRows = bottomData.filter((row) => selectionModel.includes(row.id));
    const drawingNumbers = selectedRows.map((row) => row.drawingNumber);
    const uniqueDrawingNumbers = Array.from(new Set(drawingNumbers));
    try {
      await axios.post(`/api/plan/order-groups/${selectOrderId}/concat`, {
        drawingNumbers: uniqueDrawingNumbers,
      });
      setSelectionModel([]);
      fetchBottomData(selectOrderId);
    } catch (error) {
      console.error('병합 에러:', error);
    }
  };

  // 분리: 선택된 그룹번호를 payload로 전송
  const handleSplit = async () => {
    if (!selectGroupId) {
      console.error('분리할 그룹이 선택되지 않았습니다.');
      return;
    }
    try {
      await axios.post(`/api/plan/order-groups/${selectOrderId}/split`, {
        groupNumber: selectGroupId,
      });
      // 분리 후 선택 상태 초기화
      setSelectionModel([]);
      setSelectGroupId(null);
      fetchBottomData(selectOrderId);
    } catch (error) {
      console.error('분리 에러:', error);
    }
  };

  return (
    <PageContainer title="계획 범위 지정">
      {/* 상단 테이블 */}
      <Grid container spacing={2}>
        <Grid item xs={12} mt={3}>
          <ParentCard title="태스크범위 지정 화면">
            <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
              <DataGrid
                rows={topData}
                columns={topColumns}
                columnHeaderHeight={30}
                rowHeight={25}
                disableSelectionOnClick
                onRowClick={handleRowClick}
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: '1px solid black',
                    fontSize: '12px',
                    paddingTop: '2px', // 위쪽 패딩 조정
                    paddingBottom: '2px', // 아래쪽 패딩 조정
                  },
                  '& .MuiDataGrid-columnHeader': {
                    fontSize: '14px',
                    backgroundColor: '#B2B2B2',
                    border: '1px solid black',
                  },
                  '& .group0': { backgroundColor: '#ffffff' },
                  '& .group1': { backgroundColor: '#f5f5f5' },
                  '& .error-cell': { backgroundColor: 'red', color: 'white' },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-footerContainer': { display: '' },
                  '& .index-cell': { backgroundColor: '#B2B2B2' },
                }}
              />
            </Box>
          </ParentCard>
        </Grid>
      </Grid>

      {/* 하단 테이블 */}
      <Grid container spacing={2}>
        <Grid item xs={12} mt={3}>
          <ParentCard title="그룹범위 지정 화면">
            <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
              <RangeDataGrid
                rows={bottomData}
                columns={bottomColumns}
                selectionModel={selectionModel}
                onRowClick={handleCellClick}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-end" alignItems="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMerge}
                sx={{ marginRight: '10px' }}
              >
                병합
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!selectGroupId}
                onClick={handleSplit}
              >
                분리
              </Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Range;
