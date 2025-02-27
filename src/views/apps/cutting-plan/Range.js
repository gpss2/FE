import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { Box, Grid, Stack, Button } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';

// 상단 테이블 컬럼 정의
const topColumns = [
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
  { field: 'drawingNumber', headerName: '도면번호', flex: 1 },
  { field: 'itemNo', headerName: '품목 번호', flex: 1 },
  { field: 'itemType', headerName: '품목종류', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 1 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'EndBar', flex: 1 },
  { field: 'width_mm', headerName: '폭(mm)', flex: 1 },
  { field: 'length_mm', headerName: '길이(mm)', flex: 1 },
  { field: 'cbCount', headerName: 'CB 수', flex: 1 },
  { field: 'lep_mm', headerName: 'LEP(mm)', flex: 1 },
  { field: 'rep_mm', headerName: 'REP(mm)', flex: 1 },
  { field: 'quantity', headerName: '수량', flex: 1 },
  { field: 'weight_kg', headerName: '중량(Kg)', flex: 1 },
  { field: 'groupNumber', headerName: '그룹번호', flex: 1 },
];

const Range = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedDrawings, setSelectedDrawings] = useState([]);
  const [selectOrderId, setSelectOrderId] = useState([]);
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
    fetchBottomData(selectedOrderId);
  };

  // 하단 테이블에서 특정 셀(혹은 행) 클릭 시 -> 동일한 drawingNumber를 가진 모든 행 선택
  const handleCellClick = (params) => {
    const clickedRow = params.row;
    const clickedDrawingNumber = clickedRow.drawingNumber;
    const clickedGroupNumber = clickedRow.groupNumber;
    setSelectGroupId(clickedGroupNumber);
    // 1) 어떤 기준(field)으로 토글할지 결정
    //   - groupNumber가 존재하면 groupNumber 기준으로 토글
    //   - groupNumber가 null이면 drawingNumber 기준으로 토글
    const isMerged = clickedGroupNumber !== null; // 병합된 상태인지 여부
    const toggleField = isMerged ? 'groupNumber' : 'drawingNumber';
    const toggleValue = isMerged ? clickedGroupNumber : clickedDrawingNumber;

    // 2) selectedDrawings(혹은 selectedGroups 등) 토글 로직도 비슷하게 처리할 수 있음
    //   - 여기서는 예시로 drawingNumber만 별도 저장한다고 가정
    setSelectedDrawings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(toggleValue)) {
        newSet.delete(toggleValue);
      } else {
        newSet.add(toggleValue);
      }
      return Array.from(newSet);
    });

    // 3) selectionModel(행 ID) 토글 로직
    const sameRows = bottomData
      .filter((row) => row[toggleField] === toggleValue) // groupNumber or drawingNumber
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

  const handleMerge = async () => {
    console.log('병합 시작');
    console.log(selectedDrawings);
    const response = await axios.post(`/api/plan/order-groups/${selectOrderId}/concat`, {
      drawingNumbers: selectedDrawings, // 문자열 배열
    });
    setSelectedDrawings([]);
    setSelectionModel([]);
    fetchBottomData(selectOrderId);
  };

  const handleSplit = async () => {
    console.log('분리 버튼 클릭');
    const response = await axios.post(`/api/plan/order-groups/${selectOrderId}/split`, {
      groupNumber: selectGroupId, // 문자열 배열
    });
    setSelectionModel([]);
    setSelectedDrawings([]);
    fetchBottomData(selectOrderId);
  };

  return (
    <PageContainer title="계획 범위 지정">
      {/* 상단 테이블 */}
      <Grid container spacing={2}>
        <Grid item xs={12} mt={3}>
          <ParentCard title="태스크범위 지정 화면">
            <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
              <DataGrid
                rows={topData}
                columns={topColumns}
                columnHeaderHeight={30}
                rowHeight={30}
                disableSelectionOnClick
                onRowClick={handleRowClick}
                sx={{
                  '& .MuiDataGrid-columnHeaderTitle': {
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    display: '',
                  },
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
            <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
              <DataGrid
                rows={bottomData}
                columns={bottomColumns}
                checkboxSelection
                rowSelectionModel={selectionModel}
                onSelectionModelChange={handleSelectionModelChange}
                onRowClick={handleCellClick}
                columnHeaderHeight={30}
                rowHeight={30}
                sx={{
                  '& .MuiDataGrid-columnHeaderTitle': {
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    display: '',
                  },
                }}
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
