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
  Typography,
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
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); // 선택된 그룹 저장
  // 데이터 로드
  useEffect(() => {
    fetchTopLeftData();
  }, []);
  const handleGeneratePlan = async () => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      // 그룹 목록 가져오기
      const groupResponse = await axios.get(`/api/plan/order-details/${selectedOrderId}/groups`);
      const groups = groupResponse.data.table;
      const groupNumbers = groups.map((group) => group.groupNumber);

      const eventSource = new EventSource('/api/plan/events');
      const allPlans = [];
      let isTimeout = false;

      // 타임아웃 설정 (3초)
      const timeout = setTimeout(() => {
        isTimeout = true;
        eventSource.close();
        console.warn('SSE response timeout. Using dummy data.');

        // 더미 데이터 가져오기
        import('./CuttingPlan.js')
          .then((module) => {
            const dummyData = module.default;
            console.log(dummyData);
            allPlans.push(dummyData);

            // 더미 데이터로 summaryData 생성
            const summaryData = allPlans.map((plan) => {
              const totalQuantity =
                plan.result?.table.reduce((sum, item) => sum + item.qty, 0) || 0;

              return {
                groupNumber: plan.group_id,
                totalQuantity,
                bbLossRate: plan.bbLossRate,
                cbLossRate: plan.cbLossRate,
                bbCode: plan.bbCode,
                bbUsage: plan.bbUsage,
                cbUsage: plan.cbUsage,
                bbLoss: plan.bbLoss,
                cbCode: plan.cbCode,
                cbLoss: plan.cbLoss,
                result: plan.result,
              };
            });

            setBottomData(summaryData);
            setLoading(false);
          })
          .catch((error) => console.error('Error loading dummy data:', error));
      }, 10000);

      eventSource.addEventListener('plan_complete', (e) => {
        if (isTimeout) return; // 타임아웃 발생 시 무시

        const planData = JSON.parse(e.data);
        allPlans.push(planData);

        const summaryData = allPlans.map((plan) => {
          const totalQuantity = plan.result?.table.reduce((sum, item) => sum + item.qty, 0) || 0;

          return {
            groupNumber: plan.group_id,
            totalQuantity,
            bbLossRate: plan.bbLossRate,
            cbLossRate: plan.cbLossRate,
            bbCode: plan.bbCode,
            bbUsage: plan.bbUsage,
            cbUsage: plan.cbUsage,
            bbLoss: plan.bbLoss,
            cbCode: plan.cbCode,
            cbLoss: plan.cbLoss,
            result: plan.result,
          };
        });

        // SSE 응답이 모두 도착한 경우
        if (allPlans.length === groups.length) {
          clearTimeout(timeout); // 타임아웃 클리어
          setBottomData(summaryData);
          setLoading(false);
          eventSource.close();
        }
      });

      for (const groupId of groupNumbers) {
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

  const [specCodeDetailsMap, setSpecCodeDetailsMap] = useState({
    bbCode: '',
    cbCode: '',
    bWidth: 0,
    cWidth: 0,
    length: 0,
  });

  const fetchTopRightData = async (orderId) => {
    try {
      // 1. /api/settings 요청
      const settingsResponse = await axios.get('/api/settings');
      const settings = settingsResponse.data;

      // 2. /api/plan/order-details/${orderId}/groups 요청
      const response = await axios.get(`/api/plan/order-details/${orderId}/groups`);
      const data = response.data.table;

      // 요청된 데이터에서 첫 번째 specCode 추출
      const specCodes = [...new Set(data.map((item) => item.specCode))][0]; // 중복 제거 후 첫 번째 값
      console.log('specCodes:', specCodes);

      // 3. /api/item/specific 요청
      const specificResponse = await axios.get('/api/item/specific');
      const specificData = specificResponse.data.table;
      console.log('specificData:', specificData);

      // specCode와 매칭된 데이터 찾기
      const matchingSpec = specificData.find((item) => item.systemCode === specCodes);
      console.log('matchingSpec:', matchingSpec);

      if (matchingSpec) {
        // 상태 업데이트
        setSpecCodeDetailsMap({
          length: specCodes.split('_')[1].split('-')[0],
          bbCode: matchingSpec.bbCode,
          cbCode: matchingSpec.cbCode,
          bWidth: matchingSpec.bWidth,
          cWidth: matchingSpec.cWidth,
        });
      } else {
        console.warn('No matching specCode found in /api/item/specific');
      }

      // 데이터 처리 및 설정
      const processedData = data.map((item, index) => ({
        ...item,
        id: item.groupNumber || index, // groupNumber를 id로 사용. 없을 경우 index 사용.
        compressionSetting: settings.compressionSetting || '2본-최적', // API에서 가져온 값 또는 기본값
        baseLength: settings.baseLength || 50,
        plusLAdjustment: settings.plusLAdjustment || 3.0,
        minusLAdjustment: settings.minusLAdjustment || -3.0,
        plusWAdjustment: settings.plusWAdjustment || 3.0,
        minusWAdjustment: settings.minusWAdjustment || -3.0,
        effectiveWidthLength: settings.effectiveWidthLength || 100,
        iofdLimit: settings.iofdLimit || 300,
      }));

      setTopRightData(processedData);
    } catch (error) {
      console.error('Error fetching top-right data:', error);
    }
  };

  const handlePrintInNewWindow = async () => {
    if (!selectedGroup) return;

    try {
      const windowFeatures = `
        width=1200,
        height=800,
        top=100,
        left=100,
        toolbar=no,
        menubar=no,
        scrollbars=no,
        resizable=no
      `;

      const printWindow = window.open('', 'PrintWindow', windowFeatures);

      if (printWindow) {
        const htmlContent = `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>절단계획 상세 - 품목배치 리스트</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      page-break-after: always;
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
    }
    .header h3 {
      margin: 5px 0;
    }
    .header-details {
      display: flex;
      justify-content: space-evenly;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid black;
      padding: 4px;
      text-align: center;
    }
    th {
      background-color: #f2f2f2;
    }
    .row-even {
      background-color: #ffffff;
    }
    .row-odd {
      background-color: #f9f9f9;
    }
    .print-button {
      padding: 5px 10px;
      background-color: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      margin: 10px;
    }
    .print-button:hover {
      background-color: #0056b3;
    }
    @media print {
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">출력</button>
  ${
    selectedGroup.result?.table?.length > 0
      ? selectedGroup.result.table
          .reduce(
            (acc, panel, panelIndex) => {
              panel.gratings_data.forEach((grating) => {
                acc.rows.push({
                  panelNumber: panel.panelNumber,
                  qty: panel.qty,
                  lCuttingNumber: grating.lCuttingNumber,
                  orderNumber: grating.orderNumber,
                  customerCode: grating.customerCode,
                  drawingNumber: grating.drawingNumber,
                  id: grating.id,
                  width_mm: grating.width_mm,
                  length_mm: grating.length_mm,
                  lep_mm: grating.lep_mm,
                  rep_mm: grating.rep_mm,
                  item_qty: grating.item_qty,
                  loss: panel.loss,
                });
              });
              return acc;
            },
            { rows: [] },
          )
          .rows.reduce((pages, row, index) => {
            const pageIndex = Math.floor(index / 15); // 15줄마다 새로운 페이지
            if (!pages[pageIndex]) pages[pageIndex] = [];
            pages[pageIndex].push(row);
            return pages;
          }, [])
          .map((pageRows, pageIndex) => {
            // 판 번호 최초 1회만 표시하기 위한 처리
            const seenPanelNumbers = new Set();
            const processedRows = pageRows.map((row) => {
              // 중복 체크 후 이미 본 판 번호면 '' 처리
              if (seenPanelNumbers.has(row.panelNumber)) {
                return { ...row, panelNumberForDisplay: '' };
              } else {
                seenPanelNumbers.add(row.panelNumber);
                return { ...row, panelNumberForDisplay: row.panelNumber };
              }
            });

            return `
              <div class="page">
                <div class="header">
                  <h3>절단계획 상세 - 품목배치 리스트 (그룹번호: ${selectedGroup.groupNumber})</h3>
                   <div class="header-details">
                    <h3>길이 : ${specCodeDetailsMap.length || 'N/A'}</h3>
                    <h3>BP: ${specCodeDetailsMap.bWidth || 'N/A'}</h3>
                    <h3>CB: ${specCodeDetailsMap.cbCode || 'N/A'}</h3>
                    <h3>CP: ${specCodeDetailsMap.cWidth || 'N/A'}</h3>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>판 번호</th>
                      <th>판수량</th>
                      <th>L 절단<br> 번호</th>
                      <th>수주 번호</th>
                      <th>수주처명</th>
                      <th>도면번호</th>
                      <th>품목 번호</th>
                      <th>폭 (mm)</th>
                      <th>길이 (mm)</th>
                      <th>LEP (mm)</th>
                      <th>REP (mm)</th>
                      <th>L 절단 수량</th>
                      <th>품목 수량</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${processedRows
                      .map(
                        (row, rowIndex) => `
                          <tr class="${rowIndex % 2 === 0 ? 'row-even' : 'row-odd'}">
                            <td>${row.panelNumberForDisplay}</td>
                            <td>${row.qty}</td>
                            <td>${row.lCuttingNumber}</td>
                            <td>${row.orderNumber}</td>
                            <td>${row.customerCode}</td>
                            <td>${row.drawingNumber}</td>
                            <td>${row.id}</td>
                            <td>${row.width_mm}</td>
                            <td>${row.length_mm}</td>
                            <td>${row.lep_mm}</td>
                            <td>${row.rep_mm}</td>
                            <td>${row.item_qty}</td>
                            <td>${row.item_qty}</td>
                          </tr>
                        `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
              `;
          })
          .join('')
      : '<p>데이터가 없습니다.</p>'
  }
</body>
</html>


        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error fetching specific data:', error);
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
      <br />
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
              <Button disabled={!selectedGroup} onClick={handlePrintInNewWindow}>
                상세 품목배치(작업지시폼)
              </Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Start;
