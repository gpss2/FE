import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';

const topLeftColumns = [
  { field: 'taskNumber', headerName: '태스크\n번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'customerCode', headerName: '수주\n처명', flex: 1 },
  { field: 'totalQuantity', headerName: '총\n수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량\n(Kg)', flex: 1 },
];

const topRightColumns = [
  { field: 'groupNumber', headerName: '그룹번호', flex: 1 },
  { field: 'percentage', headerName: '짝수\n비율(%)', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 1 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'compressionSetting', headerName: '압접\n본수\n설정', flex: 1 },
  { field: 'baseLength', headerName: '기본\n로스', flex: 1 },
  { field: 'plusLAdjustment', headerName: '+L\n공차', flex: 1 },
  { field: 'minusLAdjustment', headerName: '-L\n공차', flex: 1 },
  { field: 'plusWAdjustment', headerName: '+W\n공차', flex: 1 },
  { field: 'minusWAdjustment', headerName: '-W\n공차', flex: 1 },
  {
    field: 'effectiveWidthLength',
    headerName: '폭묶음 길이비(%)',
    flex: 1,
    headerClassName: 'multi-line-header',
  },
  { field: 'iofdLimit', headerName: 'IOFD\n탐색제한\n(mm)', flex: 1 },
];

const bottomColumns = [
  { field: 'groupNumber', headerName: '그룹번호', flex: 1 },
  { field: 'totalQuantity', headerName: '총판수', flex: 1 },
  { field: 'bbLossRate', headerName: 'BB 손실율(%)', flex: 1 },
  { field: 'cbLossRate', headerName: 'CB 손실율(%)', flex: 1 },
  { field: 'bbCode', headerName: 'BB 코드', flex: 1 },
  { field: 'bbUsage', headerName: 'BB 사용량(Kg)', flex: 1 },
  { field: 'bbLoss', headerName: 'BB 손실량(Kg)', flex: 1 },
  { field: 'cbCode', headerName: 'CB 코드', flex: 1 },
  { field: 'cbUsage', headerName: 'CB 사용량(Kg)', flex: 1 },
  { field: 'cbLoss', headerName: 'CB 손실량(Kg)', flex: 1 },
];

const Start = () => {
  const [topLeftData, setTopLeftData] = useState([]);
  const [topRightData, setTopRightData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 데이터 로드
  useEffect(() => {
    fetchTopLeftData();
  }, []);

  const fetchTopLeftData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      setTopLeftData(response.data.table);
    } catch (error) {
      console.error('Error fetching top-left data:', error);
    }
  };

  const fetchTopRightData = async (orderId) => {
    try {
      const response = await axios.get(`/api/plan/order-details/${orderId}`);
      const data = response.data.table;

      // groupNumber 기준으로 중복 제거
      const uniqueData = Array.from(new Map(data.map((item) => [item.groupNumber, item])).values());
      setTopRightData(uniqueData);
    } catch (error) {
      console.error('Error fetching top-right data:', error);
    }
  };

  const fetchBottomData = async (orderId) => {
    try {
      const response = await axios.get(`/api/plan/order-results/${orderId}`);
      setBottomData(response.data.table);
    } catch (error) {
      console.error('Error fetching bottom data:', error);
    }
  };

  // 왼쪽 테이블에서 행 클릭 시 오른쪽 및 하단 테이블 데이터 로드
  const handleRowClick = (params) => {
    const orderId = params.row.id;
    setSelectedOrderId(orderId);
    fetchTopRightData(orderId);
    fetchBottomData(orderId);
  };

  return (
    <PageContainer title="절단 계획 생성">
      <Grid container spacing={2}>
        {/* 상단 왼쪽 테이블 */}
        <Grid item xs={5}>
          <ParentCard title="절단계획 생성 대상">
            <Box sx={{ height: 'calc(30vh - 32px)', width: '100%' }}>
              <DataGrid
                rows={topLeftData}
                columns={topLeftColumns}
                columnHeaderHeight={45}
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
                    display: 'none',
                  },
                }}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-start">
              <Button>계획 생성</Button>
            </Stack>
          </ParentCard>
        </Grid>

        {/* 상단 오른쪽 테이블 */}
        <Grid item xs={7}>
          <ParentCard title="그룹별 계획조건 개별지정">
            <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
              <DataGrid
                rows={topRightData}
                columns={topRightColumns}
                columnHeaderHeight={60}
                rowHeight={30}
                sx={{
                  '& .MuiDataGrid-columnHeaderTitle': {
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    display: 'none',
                  },
                }}
              />
            </Box>
          </ParentCard>
        </Grid>
      </Grid>

      {/* 하단 테이블 */}
      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <ParentCard title="절단 계획 결과: 그룹별 사용자재">
            <Box sx={{ height: 'calc(40vh - 220px)', width: '100%' }}>
              <DataGrid
                rows={bottomData}
                columns={bottomColumns}
                columnHeaderHeight={30}
                rowHeight={30}
                sx={{
                  '& .MuiDataGrid-footerContainer': {
                    display: 'none',
                  },
                }}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button>상세 품목배치(작업지시폼)</Button>
              <Button>품목배치 자세히</Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Start;
