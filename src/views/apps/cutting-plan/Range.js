import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Grid, Stack, Button } from '@mui/material';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';

const topColumns = [
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'taskList', headerName: '제작사양 목록', flex: 1 },
  { field: 'type', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'clientName', headerName: '수주처명', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
];

const bottomColumns = [
  { field: 'itemId', headerName: '품목 ID', flex: 1 },
  { field: 'drawingNumber', headerName: '도면번호', flex: 1 },
  { field: 'itemNumber', headerName: '품목번호', flex: 1 },
  { field: 'itemType', headerName: '품목종류', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 1 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'endBar', headerName: 'EndBar', flex: 1 },
  { field: 'width', headerName: '폭(mm)', flex: 1 },
  { field: 'length', headerName: '길이(mm)', flex: 1 },
  { field: 'cbCount', headerName: 'CB 수', flex: 1 },
  { field: 'lep', headerName: 'LEP(mm)', flex: 1 },
  { field: 'rep', headerName: 'REP(mm)', flex: 1 },
  { field: 'quantity', headerName: '수량', flex: 1 },
  { field: 'weight', headerName: '중량(Kg)', flex: 1 },
  { field: 'groupNumber', headerName: '그룹번호', flex: 1 },
];

const Range = () => {
  const [bottomData, setBottomData] = useState([]);

  const handleRowClick = (params) => {
    const selectedOrderId = params.id;
    // 데이터 로드 로직 추가 가능
    setBottomData([]); // 데이터 초기화 또는 API 연동 시 업데이트
  };

  const handleMerge = () => {
    console.log('병합 버튼 클릭됨');
    // 병합 관련 로직 추가
  };

  const handleSplit = () => {
    console.log('분리 버튼 클릭됨');
    // 분리 관련 로직 추가
  };

  return (
    <div>
      <PageContainer title="계획 범위 지정">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="태스크범위 지정 화면">
              <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
                <DataGrid
                  rows={[]} // 더미 데이터 제거
                  columns={topColumns}
                  columnHeaderHeight={30}
                  rowHeight={30}
                  disableSelectionOnClick
                  onRowClick={handleRowClick}
                  sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap', // 줄바꿈 허용
                      textAlign: 'center', // 중앙 정렬
                      lineHeight: '1.2', // 줄 간격 조정
                    },
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none', // 페이지네이션 숨기기
                    },
                  }}
                />
              </Box>
            </ParentCard>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {/* 하단 테이블 */}
          <Grid item xs={12} mt={3}>
            <ParentCard title="그룹범위 지정 화면">
              <Box sx={{ height: 'calc(40vh - 120px)', width: '100%' }}>
                <DataGrid
                  rows={bottomData} // 초기 데이터 비움
                  columns={bottomColumns}
                  columnHeaderHeight={30}
                  rowHeight={30}
                  checkboxSelection
                  sx={{
                    '& .MuiDataGrid-columnHeaderTitle': {
                      whiteSpace: 'pre-wrap', // 줄바꿈 허용
                      textAlign: 'center', // 중앙 정렬
                      lineHeight: '1.2', // 줄 간격 조정
                    },
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none', // 페이지네이션 숨기기
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
                <Button variant="contained" color="secondary" onClick={handleSplit}>
                  분리
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </div>
  );
};

export default Range;
