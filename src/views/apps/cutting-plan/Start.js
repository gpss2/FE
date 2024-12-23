import React from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';

const topLeftColumns = [
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'type', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
];

const topRightColumns = [
  { field: 'groupNumber', headerName: '그룹번호', flex: 1 },
  { field: 'percentage', headerName: '조정 비율(%)', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 1 },
  { field: 'specCode', headerName: '사양코드', flex: 1 },
  { field: 'baseLength', headerName: '기본길이(mm)', flex: 1 },
  { field: 'widthAdjustment', headerName: '+W조차', flex: 1 },
  { field: 'totalLength', headerName: '폭유효길이(mm)', flex: 1 },
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
      <PageContainer title="절단 계획 생성 대장">
        <Grid container spacing={2}>
          {/* 상단 4:6 테이블 */}
          <Grid item xs={5}>
            <ParentCard title="절단계획 생성 대장">
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={[]}
                  columns={topLeftColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  columnHeaderHeight={30}
                  rowHeight={30}
                />
              </Box>
            </ParentCard>
          </Grid>
          <Grid item xs={7}>
            <ParentCard title="그룹별 조정값">
              <Box sx={{ height: 300, width: '100%' }}>
                <DataGrid
                  rows={[]}
                  columns={topRightColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  columnHeaderHeight={30}
                  rowHeight={30}
                />
              </Box>
            </ParentCard>
          </Grid>

          {/* 하단 3개의 테이블 */}
          <Grid item xs={12}>
            <ParentCard title="절단 계획 결과: 그룹별 사용자재">
              <Box sx={{ height: '50vh', width: '100%' }}>
                <DataGrid
                  rows={[]}
                  columns={bottomColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10]}
                  columnHeaderHeight={30}
                  rowHeight={30}
                />
              </Box>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </div>
  );
};

export default Start;
