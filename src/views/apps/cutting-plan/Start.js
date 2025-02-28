import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [compressionSetting, setCompressionSetting] = useState('Optimized');
  const [plusLAdjustment, setPlusLAdjustment] = useState(3.0);
  const [minusLAdjustment, setMinusLAdjustment] = useState(-3.0);
  const [plusWAdjustment, setPlusWAdjustment] = useState(3.0);
  const [minusWAdjustment, setMinusWAdjustment] = useState(-3.0);

  const [specCodeDetailsMap, setSpecCodeDetailsMap] = useState({
    bbCode: '',
    cbCode: '',
    bWidth: 0,
    cWidth: 0,
    length: 0,
    totalWeight: 0,
    totalCB: 0,
    totalPanel: 0,
    totalQuantity: 0,
    compressionSetting: '2본-최적',
    plusLAdjustment: 3.0,
    minusLAdjustment: -3.0,
    plusWAdjustment: 3.0,
    minusWAdjustment: -3.0,
  });
  const handleInputChange = (event) => {
    setCompressionSetting(event.target.value);
  };
  // 데이터 로드
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
  useEffect(() => {
    fetchTopLeftData();
  }, [specCodeDetailsMap]);
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

      // 타임아웃 설정 (60초)
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
      }, 30 * 60 * 1000); // 타임아웃 30분

      eventSource.addEventListener('plan_complete', (e) => {
        if (isTimeout) return; // 타임아웃 발생 시 무시

        const planData = JSON.parse(e.data);
        allPlans.push(planData);
        console.log(allPlans);
        const summaryData = allPlans.map((plan) => {
          const totalQuantity = plan.result?.table.reduce((sum, item) => sum + item.qty, 0) || 0;
          const totalCB = plan.totalCB || 0; // totalCB를 올바르게 참조

          return {
            groupNumber: plan.group_id,
            totalQuantity,
            totalCB, // 추가
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
          option: {
            compressionSetting,
            plusLAdjustment,
            minusLAdjustment,
            plusWAdjustment,
            minusWAdjustment,
          },
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
        if (matchingSpec) {
          setSpecCodeDetailsMap((prevState) => ({
            ...prevState,
            length: matchingSpec.bbCode.split('-')[1],
            bbCode: matchingSpec.bbCode,
            cbCode: matchingSpec.cbCode,
            bWidth: matchingSpec.bWidth,
            cWidth: matchingSpec.cWidth,
            compressionSetting: settings.compressionSetting,
            plusLAdjustment: settings.plusLAdjustment || 3.0,
            minusLAdjustment: settings.minusLAdjustment || -3.0,
            plusWAdjustment: settings.plusWAdjustment || 3.0,
            minusWAdjustment: settings.minusWAdjustment || -3.0,
          }));
        }
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
        const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>절단계획 상세 - 품목배치 리스트</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 15mm, 5mm;

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
          .header h2 {
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
            margin-bottom: 10px;
          }
          th, td {
            border: 1px solid black;
            padding: 4px;
            text-align: center;
          }
          th {
            background-color: gray;
          }
          .row-even {
            background-color: #ffffff;
          }
          .row-odd {
            background-color: #f2f2f2;
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
            ? (() => {
                // 1. 전체 패널 순서에 따른 색상 적용을 위한 panelOrderMap 생성
                const panelOrderMap = {};
                let panelOrderCounter = 0;
                selectedGroup.result.table.forEach((panel) => {
                  if (panelOrderMap[panel.panelNumber] === undefined) {
                    panelOrderMap[panel.panelNumber] = panelOrderCounter++;
                  }
                });

                // 2. 모든 행 데이터를 구성 (각 패널의 그라팅 데이터 + 마지막에 loss row 추가)
                const allRows = [];
                selectedGroup.result.table.forEach((panel) => {
                  // 각 패널의 그라팅 데이터
                  panel.gratings_data.forEach((grating) => {
                    allRows.push({
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
                      isLossRow: false,
                    });
                  });
                  // 패널의 마지막에 loss 정보를 위한 행 추가
                  allRows.push({
                    panelNumber: panel.panelNumber,
                    isLossRow: true,
                    loss: panel.loss,
                  });
                });

                // 3. 15줄마다 페이지로 나누기
                const pages = allRows.reduce((pages, row, index) => {
                  const pageIndex = Math.floor(index / 15);
                  if (!pages[pageIndex]) pages[pageIndex] = [];
                  pages[pageIndex].push(row);
                  return pages;
                }, []);

                // 4. 각 페이지별 HTML 생성
                return pages
                  .map((pageRows, pageIndex, pagesArr) => {
                    const isLastPage = pageIndex === pagesArr.length - 1;
                    // 페이지 내에서 판 번호 중복 표시는 한 번만 (해당 페이지 내)
                    const seenPanelNumbers = new Set();
                    // **변경된 부분: 판수량(qtyForDisplay)도 첫 번째에만 표시**
                    const processedRows = pageRows.map((row) => {
                      if (!row.isLossRow) {
                        if (seenPanelNumbers.has(row.panelNumber)) {
                          return { ...row, panelNumberForDisplay: '', qtyForDisplay: '' };
                        } else {
                          seenPanelNumbers.add(row.panelNumber);
                          return {
                            ...row,
                            panelNumberForDisplay: row.panelNumber,
                            qtyForDisplay: row.qty,
                          };
                        }
                      } else {
                        // loss row는 판번호와 판수량 셀은 빈값 처리
                        return { ...row, panelNumberForDisplay: '', qtyForDisplay: '' };
                      }
                    });

                    return `
                      <div class="page">
                        <div class="header">
                          <h2>절단계획 상세 - 품목배치 리스트 (그룹번호: ${
                            selectedGroup.groupNumber
                          })</h2>
                          <div class="header-details">
                            <h2>압전본수: ${'2' || '2'}</h2>
                            <h2>총중량: ${specCodeDetailsMap.totalWeight || 'N/A'}</h2>
                            <h2>공차(+L: ${selectedGroup.plusLAdjustment || 'N/A'} -L: ${
                      selectedGroup.minusLAdjustment || 'N/A'
                    } +W: ${selectedGroup.plusWAdjustment || 'N/A'} -W: ${
                      selectedGroup.minusWAdjustment || 'N/A'
                    })</h2>
                          </div>
                          <div class="header-details">
                            <h2>BB: ${specCodeDetailsMap.bbCode.split('_')[0] || 'N/A'}</h2>
                            <h2>길이: ${specCodeDetailsMap.length || 'N/A'}</h2>
                            <h2>BP: ${specCodeDetailsMap.bWidth || 'N/A'}</h2>
                            <h2>CB: ${specCodeDetailsMap.cbCode.split('_')[0] || 'N/A'}</h2>
                            <h2>CP: ${specCodeDetailsMap.cWidth || 'N/A'}</h2>
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
                              .map((row) => {
                                // 전역 panelOrderMap을 참조하여, 해당 판의 순서에 따라 배경색 결정 (짝수: row-even, 홀수: row-odd)
                                const rowClass =
                                  panelOrderMap[row.panelNumber] % 2 === 0 ? 'row-even' : 'row-odd';
                                if (row.isLossRow) {
                                  return `
                                    <tr class="${rowClass}">
                                      <td></td>
                                      <td></td>
                                      <td>Loss</td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      <td>${row.loss}</td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                    </tr>
                                  `;
                                } else {
                                  return `
                                    <tr class="${rowClass}">
                                      <td>${row.panelNumberForDisplay}</td>
                                      <td>${row.qtyForDisplay}</td>
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
                                  `;
                                }
                              })
                              .join('')}
                            ${
                              isLastPage
                                ? `
                              <!-- 마지막 페이지에만 최종 합계 2줄 추가 (왼쪽에 배치) -->
                              <tr>
                                <th>합계</th>
                                <th>총판수</th>
                                <th>절단수량</th>
                                <th>총 CB수량</th>
                                <th>총품목수량</th>
                                <td colspan="8"></td>
                              </tr>
                              <tr>
                                <td></td>
                                <td>${selectedGroup.result.table.length || 'N/A'}</td>
                                <td>${specCodeDetailsMap.totalQuantity || 'N/A'}</td>
                                <td>${selectedGroup.totalCB}</td>
                                <td>${specCodeDetailsMap.totalQuantity || 'N/A'}</td>
                                <td colspan="8"></td>
                              </tr>
                              `
                                : ''
                            }
                          </tbody>
                        </table>
                      </div>
                    `;
                  })
                  .join('');
              })()
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
    const totalWeight = params.row.totalWeight;
    const totalQuantity = params.row.totalQuantity;
    setSpecCodeDetailsMap((prevState) => ({
      ...prevState,
      totalWeight: totalWeight,
      totalQuantity: totalQuantity,
    }));
    console.log(specCodeDetailsMap);
    setSelectedOrderId(orderId);
    fetchTopRightData(orderId);
  };
  const handleModalSave = () => {
    // 필요시 specCodeDetailsMap에도 업데이트 가능
    setSpecCodeDetailsMap((prev) => ({
      ...prev,
      compressionSetting,
      plusLAdjustment,
      minusLAdjustment,
      plusWAdjustment,
      minusWAdjustment,
    }));
    setModalOpen(false);
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
            <Stack direction="row" justifyContent="flex-start" spacing={1}>
              <Button disabled={!selectedOrderId || loading} onClick={handleGeneratePlan}>
                {loading ? <CircularProgress size={24} /> : '계획 생성'}
              </Button>
              <Button onClick={() => setModalOpen(true)}>설정 변경</Button>
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
                    display: '',
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
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>설정 변경</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Select
              label="압전본 설정"
              value={compressionSetting}
              onChange={(e) => setCompressionSetting(e.target.value)}
              fullWidth
            >
              <MenuItem value="Optimized">2본-최적</MenuItem>
              <MenuItem value="Basic">2본-기본</MenuItem>
            </Select>

            <TextField
              label="+L 공차"
              type="number"
              value={plusLAdjustment}
              onChange={(e) => setPlusLAdjustment(parseFloat(e.target.value))}
            />
            <TextField
              label="-L 공차"
              type="number"
              value={minusLAdjustment}
              onChange={(e) => setMinusLAdjustment(parseFloat(e.target.value))}
            />
            <TextField
              label="+W 공차"
              type="number"
              value={plusWAdjustment}
              onChange={(e) => setPlusWAdjustment(parseFloat(e.target.value))}
            />
            <TextField
              label="-W 공차"
              type="number"
              value={minusWAdjustment}
              onChange={(e) => setMinusWAdjustment(parseFloat(e.target.value))}
            />
            <Button variant="contained" onClick={handleModalSave}>
              저장
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Start;
