import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { Stack } from '@mui/system';

const topLeftColumns = [
  { field: 'taskNumber', headerName: '태스크\n번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'type', headerName: '구분', flex: 1 },
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
  return (
    <div>
      <PageContainer title="절단 계획 생성">
        <br />
        <Grid container spacing={2}>
          {/* 상단 4:6 테이블 */}
          <Grid item xs={5}>
            <ParentCard title="절단계획 생성 대상">
              <Box sx={{ height: 200, width: '100%' }}>
                <DataGrid
                  rows={[]}
                  columns={topLeftColumns}
                  columnHeaderHeight={45}
                  rowHeight={30}
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
              <Stack direction="row" justifyContent="flex-start">
                <Button>계획 생성</Button>
              </Stack>
            </ParentCard>
          </Grid>
          <Grid item xs={7}>
            <ParentCard title="그룹별 계획조건 개별지정 - 태스크 :">
              <Box sx={{ height: 235, width: '100%' }}>
                <DataGrid
                  rows={[]}
                  columns={topRightColumns}
                  columnHeaderHeight={60}
                  rowHeight={30}
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

          {/* 하단 3개의 테이블 */}
          <Grid item xs={12}>
            <ParentCard title="절단 계획 결과: 그룹별 사용자재 - 태스크">
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={[]}
                  columns={bottomColumns}
                  columnHeaderHeight={30}
                  rowHeight={30}
                  sx={{
                    '& .MuiDataGrid-footerContainer': {
                      display: 'none', // 페이지네이션 숨기기
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
    </div>
  );
};

export default Start;
