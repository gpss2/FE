import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import NewWindow from 'react-new-window';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import DrawingCanvas from './DrawingCanvas.js';
const indexColumn = {
  field: 'index',
  headerName: '',
  width: 30,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  cellClassName: 'index-cell',
  renderCell: (params) => {
    const sortedRowIds = params.api.getSortedRowIds();
    return sortedRowIds.indexOf(params.id) + 1;
  },
};

const topLeftColumns = [
  indexColumn,
  { field: 'taskNumber', headerName: '태스크\n번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', width: 110 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'customerCode', headerName: '수주\n처명', flex: 1 },
  { field: 'totalQuantity', headerName: '총\n수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량\n(Kg)', flex: 1 },
];

const topRightColumns = [
  indexColumn,
  { field: 'groupNumber', headerName: '그룹번호', width: 160 },
  { field: 'percentage', headerName: '짝수\n비율(%)', flex: 1 },
  { field: 'itemName', headerName: '품명', flex: 1 },
  { field: 'specCode', headerName: '사양코드', width: 140 },
  {
    field: 'compressionSetting',
    headerName: '압접본수\n설정',
    flex: 1,
    renderCell: (params) => {
      if (params.value === 'Optimized') return '2본 최적';
      if (params.value === 'Basic') return '2본 기본';
      return params.value;
    },
  },
  { field: 'baseLength', headerName: '기본\n로스', flex: 1 },
  { field: 'plusLAdjustment', headerName: '+L\n공차', width: 50 },
  { field: 'minusLAdjustment', headerName: '-L\n공차', width: 50 },
  { field: 'plusWAdjustment', headerName: '+W\n공차', width: 50 },
  { field: 'minusWAdjustment', headerName: '-W\n공차', width: 50 },
  {
    field: 'effectiveWidthLength',
    headerName: '폭묶음 길이비(%)',
    flex: 1,
    headerClassName: 'multi-line-header',
  },
  { field: 'iofdLimit', headerName: 'IOFD\n탐색제한\n(mm)', flex: 1 },
];

const bottomColumns = [
  indexColumn,
  { field: 'groupNumber', headerName: '그룹번호', width: 160 },
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
  // refs for modal fields (순서: 압전본 설정 -> +L -> -L -> +W -> -W)
  const compressionSettingRef = useRef(null);
  const plusLAdjustmentRef = useRef(null);
  const minusLAdjustmentRef = useRef(null);
  const plusWAdjustmentRef = useRef(null);
  const minusWAdjustmentRef = useRef(null);

  const [topLeftData, setTopLeftData] = useState([]);
  const [topRightData, setTopRightData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // 모달에서 변경하는 값들
  const [compressionSetting, setCompressionSetting] = useState('Optimized');
  const [plusLAdjustment, setPlusLAdjustment] = useState(3.0);
  const [minusLAdjustment, setMinusLAdjustment] = useState('-3');
  const [plusWAdjustment, setPlusWAdjustment] = useState(3.0);
  const [minusWAdjustment, setMinusWAdjustment] = useState('-3');

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
  const [openDrawingWindow, setOpenDrawingWindow] = useState(false);

  // axios 인터셉터 설정
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

      // 타임아웃 설정 (30분)
      const timeout = setTimeout(() => {
        isTimeout = true;
        eventSource.close();
        console.warn('SSE response timeout. Using dummy data.');

        // 더미 데이터 가져오기
        import('./CuttingPlan.js')
          .then((module) => {
            const dummyData = module.default;
            allPlans.push(dummyData);

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
      }, 30 * 60 * 1000);

      eventSource.addEventListener('plan_complete', (e) => {
        if (isTimeout) return;
        const planData = JSON.parse(e.data);
        allPlans.push(planData);
        const summaryData = allPlans.map((plan) => {
          const totalQuantity = plan.result?.table.reduce((sum, item) => sum + item.qty, 0) || 0;
          const totalCB = plan.totalCB || 0;
          return {
            groupNumber: plan.group_id,
            totalQuantity,
            totalCB,
            bbLossRate: plan.bbLossRate,
            cbLossRate: plan.cbLossRate,
            bbCode: plan.bbCode,
            bbUsage: plan.bbUsage,
            cbUsage: plan.cbUsage,
            bbLoss: plan.bbLoss,
            cbCode: plan.cbCode,
            cbLoss: plan.cbLoss,
            result: plan.result,
            minusLAdjustment: plan.minusLAdjustment,
            minusWAdjustment: plan.minusWAdjustment,
            plusLAdjustment: plan.plusLAdjustment,
            plusWAdjustment: plan.plusWAdjustment,
          };
        });

        // SSE 이벤트가 올 때마다 하단 테이블 업데이트
        setBottomData(summaryData);

        if (allPlans.length === groups.length) {
          clearTimeout(timeout);
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

  const handleViewDrawing = () => {
    if (!selectedGroup) return;
    setOpenDrawingWindow(true);
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
      const settingsResponse = await axios.get('/api/settings');
      const settings = settingsResponse.data;
      const response = await axios.get(`/api/plan/order-details/${orderId}/groups`);
      const data = response.data.table;
      const specCodes = [...new Set(data.map((item) => item.specCode))][0];
      const specificResponse = await axios.get('/api/item/specific');
      const specificData = specificResponse.data.table;
      const matchingSpec = specificData.find((item) => item.systemCode === specCodes);
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
      } else {
        console.warn('No matching specCode found in /api/item/specific');
      }
      const processedData = data.map((item, index) => ({
        ...item,
        id: item.groupNumber || index,
        compressionSetting: compressionSetting,
        baseLength: settings.baseLength || 50,
        plusLAdjustment: plusLAdjustment,
        minusLAdjustment: minusLAdjustment,
        plusWAdjustment: plusWAdjustment,
        minusWAdjustment: minusWAdjustment,
        effectiveWidthLength: settings.effectiveWidthLength || 100,
        iofdLimit: settings.iofdLimit || 300,
      }));
      setTopRightData(processedData);
    } catch (error) {
      console.error('Error fetching top-right data:', error);
    }
  };

  const handlePrintInNewWindow = async () => {
    function transformCode(code) {
      // 첫 번째 숫자가 시작되는 인덱스 찾기
      const firstDigitIndex = code.search(/\d/);
      // 숫자가 없거나 최소한 7자리(길이 3 + 너비 정수 3 + 너비 소수 1)가 없으면 원본 반환
      if (firstDigitIndex === -1 || code.length < firstDigitIndex + 7) return code;

      // 타입 부분: 첫 번째 숫자 전까지
      const typePart = code.substring(0, firstDigitIndex);

      // 뒤쪽 7자리는 각각: 길이(3자리), 너비 정수부(3자리), 너비 소수부(1자리)
      const lengthPart = parseInt(code.substring(firstDigitIndex, firstDigitIndex + 3), 10);
      const widthInt = parseInt(code.substring(firstDigitIndex + 3, firstDigitIndex + 6), 10);
      const widthDec = code.substring(firstDigitIndex + 6, firstDigitIndex + 7);

      // 소수부가 '0'이면 소수점 없이, 아니라면 정수부와 소수부를 '.'로 연결
      const widthPart = widthDec === '0' ? widthInt.toString() : `${widthInt}.${widthDec}`;

      return `${typePart}${lengthPart}*${widthPart}`;
    }
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
        // allRows 배열에 모든 행이 들어있음 (loss row 포함)
        const allRows = [];
        selectedGroup.result.table.forEach((panel) => {
          panel.gratings_data.forEach((grating) => {
            allRows.push({
              panelNumber: panel.panelNumber,
              qty: panel.qty,
              lCuttingNumber: grating.lCuttingNumber, // 기존 번호 (식별용)
              lCuttingQty: grating.item_qty || 0,
              orderNumber: grating.orderNumber,
              customerCode: grating.customerCode,
              drawingNumber: grating.drawingNumber,
              id: grating.id,
              width_mm: grating.width_mm,
              length_mm: grating.length_mm,
              lep_mm: grating.lep_mm,
              rep_mm: grating.rep_mm,
              item_qty: grating.item_qty || 0, // 품목 수량
              loss: panel.loss,
              isLossRow: false,
            });
          });
          // loss row 추가
          allRows.push({
            panelNumber: panel.panelNumber,
            isLossRow: true,
            loss: panel.loss,
          });
        });
        // 페이지 나누기 (22줄씩)
        const pages = allRows.reduce((pages, row, index) => {
          const pageIndex = Math.floor(index / 22);
          if (!pages[pageIndex]) pages[pageIndex] = [];
          pages[pageIndex].push(row);
          return pages;
        }, []);
        // 전체 합계 계산 (loss row 제외)
        const totalLCuttingQty = allRows.reduce((sum, row) => {
          return row.isLossRow ? sum : sum + Number(row.lCuttingQty);
        }, 0);
        const totalItemQty = allRows.reduce((sum, row) => {
          return row.isLossRow ? sum : sum + Number(row.item_qty);
        }, 0);
        // HTML 생성 (페이지별)
        const htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>절단계획 상세 - 품목배치 리스트 (그룹번호: ${selectedGroup.groupNumber})</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm 5mm 5mm 5mm;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            .page {
              page-break-after: always;
            }
            .header {
              text-align: left;
              padding-left: 10px;
            }
            .header h2 {
              margin: 5px 0;
              font-size: 20px;
            }
            .header-details {
              display: flex;
              justify-content: flex-start;
            }
            .header-details > h2{
              padding-right: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td {
              border: 1px solid black;
              padding-right: 3px;
              padding-top: 0px;
              padding-bottom: 0px;
              text-align: right;
              line-height: 25px;
              font-weight: bold;
              height: 25px;
            }
              td:nth-child(8),  /* 품목번호 */
              td:nth-child(10), /* 길이 */
              td:nth-child(12), /* REP */
              td:nth-child(13)  /* L 절단 수량 */ {
              border-right: 2px solid black;
            }
            th {
             border: 1px solid black;
              background-color: #B2B2B2;
              color: black;
              text-align: center;
              line-height: 25px;
              font-weight: bold;
              height: 25px;
            }
            tr {
              height: 25px;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">출력</button>
          ${
            // IIFE를 사용하여 페이지 전체에서 그룹 배경색 관련 변수들을 유지합니다.
            (() => {
              let currentGroupColor = '';
              let prevGroupPanel = null;
              let toggle = false;

              return pages.length > 0
                ? pages
                    .map((pageRows, pageIndex, pagesArr) => {
                      const cumulativeOffset = pagesArr
                        .slice(0, pageIndex)
                        .reduce((sum, p) => sum + p.length, 0);
                      const rowsHtml = pageRows
                        .map((row, rowIndex) => {
                          const globalIndex = cumulativeOffset + rowIndex;
                          const rawPanel = row.panelNumberForDisplay || row.panelNumber || '';
                          if (!row.isLossRow && rawPanel !== '' && rawPanel !== prevGroupPanel) {
                            toggle = !toggle;
                            currentGroupColor = toggle ? 'white' : 'yellow';
                            prevGroupPanel = rawPanel;
                          }
                          const rowStyle = currentGroupColor
                            ? ` style="background-color: ${currentGroupColor};"`
                            : '';
                          const leftCellStyle = ' style="background-color: #B2B2B2;"';
                          let panelNumberValue = rawPanel;
                          let qtyValue = row.qtyForDisplay || row.qty;
                          let orderNumberValue = row.orderNumber;
                          let customerValue = row.customerCode;
                          if (globalIndex > 0) {
                            let prevRow;
                            if (rowIndex === 0) {
                              prevRow = pages[pageIndex - 1][pages[pageIndex - 1].length - 1];
                            } else {
                              prevRow = pageRows[rowIndex - 1];
                            }
                            const prevRawPanel =
                              prevRow.panelNumberForDisplay || prevRow.panelNumber || '';
                            if (rawPanel === prevRawPanel) {
                              panelNumberValue = '';
                            }
                            const prevQty = prevRow.qtyForDisplay || prevRow.qty;
                            if (qtyValue === prevQty) {
                              qtyValue = '';
                            }
                            const prevOrderNumber = prevRow.orderNumber;
                            if (orderNumberValue === prevOrderNumber) {
                              orderNumberValue = '';
                            }
                            const prevCustomer = prevRow.customerCode;
                            if (customerValue === prevCustomer) {
                              customerValue = '';
                            }
                          }

                          if (row.isLossRow) {
                            return `
                            <tr${rowStyle}>
                              <td${leftCellStyle}>${globalIndex + 1}</td>
                              <td></td>
                              <td></td>
                              <td>Loss</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>${row.loss}</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          `;
                          } else {
                            return `
                            <tr${rowStyle}>
                              <td${leftCellStyle}>${globalIndex + 1}</td>
                              <td>${panelNumberValue}</td>
                              <td>${qtyValue}</td>
                              <td>${row.lCuttingNumber}</td>
                              <td>${orderNumberValue}</td>
                              <td>${customerValue}</td>
                              <td>${row.drawingNumber}</td>
                              <td>${row.id}</td>
                              <td>${row.width_mm}</td>
                              <td>${row.length_mm}</td>
                              <td>${row.lep_mm}</td>
                              <td>${row.rep_mm}</td>
                              <td>${row.lCuttingQty}</td>
                              <td>${row.item_qty}</td>
                            </tr>
                          `;
                          }
                        })
                        .join('');
                      const sumHtml =
                        pageIndex === pagesArr.length - 1
                          ? `
                    <tr style="color: black;">
                      <th></th>
                      <th>합계</th>
                      <th>총판수</th>
                      <th>절단수량</th>
                      <th>총 CB수량</th>
                      <th>총품목수량</th>
                      <th colspan="8"></th>
                    </tr>
                    <tr style="background-color: white; color: black;">
                      <td></td>
                      <td></td>
                      <td>${selectedGroup.result.table.length || 'N/A'}</td>
                      <td>${totalLCuttingQty}</td>
                      <td>${selectedGroup.totalCB || 0}</td>
                      <td>${totalItemQty}</td>
                      <td colspan="8"></td>
                    </tr>
                  `
                          : '';
                      return `
                    <div class="page">
                      <div class="header">
                        <h2 style="text-decoration: underline">절단계획 상세 - 품목배치 리스트 (그룹번호: ${
                          selectedGroup.groupNumber
                        })</h2>
                        <div class="header-details">
                          <h2>압전본수: ${selectedGroup.compressionSetting || '2'}</h2>
                          <h2>총중량: ${selectedGroup.result.totalWeight || 'N/A'}</h2>
                          <h2>공차(+L: ${selectedGroup.plusLAdjustment || 'N/A'} -L: ${
                        selectedGroup.minusLAdjustment || 'N/A'
                      } +W: ${selectedGroup.plusWAdjustment || 'N/A'} -W: ${
                        selectedGroup.minusWAdjustment || 'N/A'
                      })</h2>
                        </div>
                        <div class="header-details">
                          <h2>BB: ${
                            specCodeDetailsMap.bbCode
                              ? transformCode(specCodeDetailsMap.bbCode)
                              : 'N/A'
                          }</h2>
                          <h2>길이: ${specCodeDetailsMap.length || 'N/A'}</h2>
                          <h2>BP: ${specCodeDetailsMap.bWidth || 'N/A'}</h2>
                          <h2>CB: ${
                            specCodeDetailsMap.cbCode
                              ? transformCode(specCodeDetailsMap.cbCode)
                              : 'N/A'
                          }</h2>
                          <h2>CP: ${specCodeDetailsMap.cWidth || 'N/A'}</h2>
                          <h2>EB: ${transformCode(selectedGroup.result.ebCode) || 'SQ6*6'}</h2>
                        </div>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            <th></th>
                            <th>판 번호</th>
                            <th>판수량</th>
                            <th>L 절단<br>번호</th>
                            <th>수주 번호</th>
                            <th>수주처명</th>
                            <th>도면번호/<br>품명</th>
                            <th>품목<br>번호</th>
                            <th>폭</th>
                            <th>길이</th>
                            <th>LEP</th>
                            <th>REP</th>
                            <th>L 절단<br>수량</th>
                            <th>품목<br>수량</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${rowsHtml}
                          ${sumHtml}
                        </tbody>
                      </table>
                    </div>
                  `;
                    })
                    .join('')
                : '<p>데이터가 없습니다.</p>';
            })()
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

  const handleRowClick = (params) => {
    const orderId = params.row.id;
    const totalWeight = params.row.totalWeight;
    const totalQuantity = params.row.totalQuantity;
    setSpecCodeDetailsMap((prevState) => ({
      ...prevState,
      totalWeight: totalWeight,
      totalQuantity: totalQuantity,
    }));
    setSelectedOrderId(orderId);
    fetchTopRightData(orderId);
  };

  const handleModalSave = () => {
    setSpecCodeDetailsMap((prev) => ({
      ...prev,
      compressionSetting,
      plusLAdjustment,
      minusLAdjustment,
      plusWAdjustment,
      minusWAdjustment,
    }));
    setTopRightData((prevData) =>
      prevData.map((row) => ({
        ...row,
        compressionSetting: compressionSetting,
        plusLAdjustment: plusLAdjustment,
        minusLAdjustment: minusLAdjustment,
        plusWAdjustment: plusWAdjustment,
        minusWAdjustment: minusWAdjustment,
      })),
    );
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
                disableSelectionOnClick
                onRowClick={handleRowClick}
                rowHeight={25}
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: '1px solid black',
                    fontSize: '12px',
                    paddingTop: '2px', // 위쪽 패딩 조정
                    paddingBottom: '2px', // 아래쪽 패딩 조정
                  },
                  '& .MuiDataGrid-columnHeader': {
                    fontSize: '12px',
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
                rowHeight={25}
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: '1px solid black',
                    fontSize: '12px',
                    paddingTop: '2px', // 위쪽 패딩 조정
                    paddingBottom: '2px', // 아래쪽 패딩 조정
                  },
                  '& .MuiDataGrid-columnHeader': {
                    fontSize: '12px',
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
                rowHeight={25}
                sx={{
                  '& .MuiDataGrid-cell': {
                    border: '1px solid black',
                    fontSize: '12px',
                    paddingTop: '2px', // 위쪽 패딩 조정
                    paddingBottom: '2px', // 아래쪽 패딩 조정
                  },
                  '& .MuiDataGrid-columnHeader': {
                    fontSize: '12px',
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
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button disabled={!selectedGroup} onClick={handlePrintInNewWindow}>
                상세 품목배치(작업지시폼)
              </Button>
              <Button disabled={!selectedGroup} onClick={handleViewDrawing}>
                상세보기
              </Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>설정 변경</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* 압전본 설정 Select */}
            <Select
              label="압전본 설정"
              value={compressionSetting}
              onChange={(e) => setCompressionSetting(e.target.value)}
              fullWidth
              inputRef={compressionSettingRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  plusLAdjustmentRef.current.focus();
                }
              }}
            >
              <MenuItem value="Optimized">2본-최적</MenuItem>
              <MenuItem value="Basic">2본-기본</MenuItem>
            </Select>
            {/* +L 공차 */}
            <TextField
              label="+L 공차"
              type="number"
              value={plusLAdjustment}
              onChange={(e) => setPlusLAdjustment(parseFloat(e.target.value))}
              inputRef={plusLAdjustmentRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  minusLAdjustmentRef.current.focus();
                }
              }}
            />
            {/* -L 공차 */}
            <TextField
              label="-L 공차"
              type="number"
              value={minusLAdjustment}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '-' || val === '' || !isNaN(Number(val))) {
                  setMinusLAdjustment(val);
                }
              }}
              onBlur={() => {
                const parsed = parseFloat(minusLAdjustment);
                if (!isNaN(parsed)) {
                  setMinusLAdjustment(parsed.toString());
                }
              }}
              inputRef={minusLAdjustmentRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  plusWAdjustmentRef.current.focus();
                }
              }}
            />
            {/* +W 공차 */}
            <TextField
              label="+W 공차"
              type="number"
              value={plusWAdjustment}
              onChange={(e) => setPlusWAdjustment(parseFloat(e.target.value))}
              inputRef={plusWAdjustmentRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  minusWAdjustmentRef.current.focus();
                }
              }}
            />
            {/* -W 공차 */}
            <TextField
              label="-W 공차"
              type="number"
              value={minusWAdjustment}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '-' || val === '' || !isNaN(Number(val))) {
                  setMinusWAdjustment(val);
                }
              }}
              onBlur={() => {
                const parsed = parseFloat(minusWAdjustment);
                if (!isNaN(parsed)) {
                  setMinusWAdjustment(parsed.toString());
                }
              }}
              inputRef={minusWAdjustmentRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleModalSave();
                }
              }}
            />
            <Button variant="contained" onClick={handleModalSave}>
              저장
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      {openDrawingWindow && selectedGroup && (
        <NewWindow
          title={`도면 - 그룹번호: ${selectedGroup.groupNumber}`}
          onUnload={() => setOpenDrawingWindow(false)}
          copyStyles={false}
          features={{
            width: 1200,
            height: 800,
            top: 100,
            left: 100,
            toolbar: 'no',
            menubar: 'no',
            scrollbars: 'yes',
            resizable: 'yes',
          }}
        >
          <DrawingCanvas data={selectedGroup.result} />
        </NewWindow>
      )}
    </PageContainer>
  );
};

export default Start;
