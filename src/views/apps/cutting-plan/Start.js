import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { result } from 'lodash';

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
  const [sseData, setSseData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); // 선택된 그룹 저장
  // 데이터 로드
  useEffect(() => {
    fetchTopLeftData();
  }, []);
  const handleShowDetails = () => {
    if (selectedGroup?.result?.table) {
      console.log(selectedGroup.result.table);
      const details = selectedGroup.result.table.flatMap((item) =>
        item.gratings_data.map((detail) => ({
          id: detail.id,
          width_mm: detail.width_mm,
          length_mm: detail.length_mm,
          lep_mm: detail.lep_mm,
          rep_mm: detail.rep_mm,
        })),
      );
      setSelectedGroupData(details);
      setOpenDialog(true);
    }
  };

  const detailColumns = [
    { field: 'id', headerName: '품목번호', flex: 1 },
    { field: 'width_mm', headerName: '폭', flex: 1 },
    { field: 'length_mm', headerName: '길이', flex: 1 },
    { field: 'lep_mm', headerName: 'LEP', flex: 1 },
    { field: 'rep_mm', headerName: 'REP', flex: 1 },
  ];

  const handleGeneratePlan = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      // 그룹 목록 가져오기
      const groupResponse = await axios.get(`/api/plan/order-details/${selectedOrderId}/groups`);
      const groups = groupResponse.data.groups;

      // 그룹별로 절단 계획 요청
      const eventSource = new EventSource('/api/plan/events');
      const allPlans = [];

      eventSource.addEventListener('plan_complete', (e) => {
        const planData = JSON.parse(e.data);
        allPlans.push(planData);

        // 요약 정보를 생성
        const summaryData = allPlans.map((plan) => {
          const totalQuantity = plan.result?.table.reduce((sum, item) => sum + item.qty, 0) || 0;

          return {
            groupNumber: plan.group_id,
            totalQuantity,
            bbLossRate: null, // 비워둠
            cbLossRate: null, // 비워둠
            bbCode: 'I38*5*3_1100', // 고정값
            bbUsage: null, // 비워둠
            bbLoss: null, // 비워둠
            cbCode: 'F25*4.5*1.2_6100', // 고정값
            cbLoss: null, // 비워둠
            result: plan.result,
          };
        });

        // SSE 응답이 모두 도착한 경우 하단 테이블 업데이트
        if (allPlans.length === groups.length) {
          setBottomData(summaryData);
          setLoading(false);
          eventSource.close();
        }
      });

      for (const groupId of groups) {
        await axios.post('/api/plan/generate', {
          order_id: selectedOrderId,
          group_id: groupId,
        });
      }
    } catch (error) {
      console.error('Error generating plans:', error);
    }
  };

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

      // 짝수 비율 계산 후 데이터 가공
      const processedData = data.map((item) => {
        // cbCount가 배열이 아니면 빈 배열로 초기화
        const cbCountArray = Array.isArray(item.cbCount) ? item.cbCount : [];

        // 짝수 개수와 비율 계산
        const evenCount = cbCountArray.filter((count) => count % 2 === 0).length;
        const evenPercentage = cbCountArray.length ? (evenCount / cbCountArray.length) * 100 : 0;

        return {
          ...item,
          percentage: evenPercentage, // 짝수 비율(%) 계산 후 추가
          compressionSetting: item.compressionSetting || '2본-최적',
          baseLength: item.baseLength || 50,
          plusLAdjustment: item.plusLAdjustment || 3.0,
          minusLAdjustment: item.minusLAdjustment || -3.0,
          plusWAdjustment: item.plusWAdjustment || 3.0,
          minusWAdjustment: item.minusWAdjustment || -3.0,
          effectiveWidthLength: item.effectiveWidthLength || 100,
          iofdLimit: item.iofdLimit || 300,
        };
      });

      // groupNumber 기준으로 중복 제거
      const uniqueData = Array.from(
        new Map(processedData.map((item) => [item.groupNumber, item])).values(),
      );

      setTopRightData(uniqueData);
    } catch (error) {
      console.error('Error fetching top-right data:', error);
    }
  };

  // 왼쪽 테이블에서 행 클릭 시 오른쪽 및 하단 테이블 데이터 로드
  const handleRowClick = (params) => {
    const orderId = params.row.id;
    setSelectedOrderId(orderId);
    fetchTopRightData(orderId);
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
              <Button disabled={!selectedOrderId || loading} onClick={handleGeneratePlan}>
                {loading ? <CircularProgress size={24} /> : '계획 생성'}
              </Button>
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
            <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
              <DataGrid
                rows={bottomData}
                getRowId={(row) => row.groupNumber}
                onRowSelectionModelChange={(ids) => {
                  const selected = bottomData.find((row) => row.groupNumber === ids[0]);
                  setSelectedGroup(selected);
                }}
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
              <Button disabled={!selectedGroup} onClick={handleShowDetails}>
                상세 품목배치(작업지시폼)
              </Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>상세 품목 배치</DialogTitle>
        <DialogContent>
          {/* selectedGroup이 존재하고 데이터가 올바른 경우에만 렌더링 */}
          {selectedGroup && selectedGroup.result?.table?.length > 0 ? (
            selectedGroup.result.table.map((panel) => (
              <Box key={panel.panelNumber} mb={3}>
                <h3>판 번호: {panel.panelNumber}</h3>
                <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>품목 번호</th>
                      <th>LEP (mm)</th>
                      <th>REP (mm)</th>
                      <th>폭 (mm)</th>
                      <th>길이 (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panel.gratings_data.map((grating) => (
                      <tr key={grating.id}>
                        <td>{grating.id}</td>
                        <td>{grating.lep_mm}</td>
                        <td>{grating.rep_mm}</td>
                        <td>{grating.width_mm}</td>
                        <td>{grating.length_mm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ))
          ) : (
            <p>데이터를 불러오는 중입니다...</p>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Start;
