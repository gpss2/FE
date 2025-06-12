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
import SearchableSelect from '../../../components/shared/SearchableSelect.js';
import axios from 'axios';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import DrawingCanvas from './DrawingCanvas.js';
import StartDataGrid from './StartDataGrid.js';
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
  // {
  //   field: 'effectiveWidthLength',
  //   headerName: '폭묶음 길이비(%)',
  //   flex: 1,
  //   headerClassName: 'multi-line-header',
  // },
  // { field: 'iofdLimit', headerName: 'IOFD\n탐색제한\n(mm)', flex: 1 },
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
  // refs for modal fields (순서: 압접본 설정 -> +L -> -L -> +W -> -W)
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
  const [baseLength, setBaseLength] = useState(50);
  const [plusLAdjustment, setPlusLAdjustment] = useState(3.0);
  const [minusLAdjustment, setMinusLAdjustment] = useState('-3');
  const [plusWAdjustment, setPlusWAdjustment] = useState(3.0);
  const [minusWAdjustment, setMinusWAdjustment] = useState('-3');
  const [loadingTopRight, setLoadingTopRight] = useState(false);

  // 모달 open/close
  const [specModalOpen, setSpecModalOpen] = useState(false);
  // API에서 가져올 옵션들
  const [specOptions, setSpecOptions] = useState([]);
  // 모달에서 선택한 specCode
  const [selectedSpecCode, setSelectedSpecCode] = useState('');
  // 저장 버튼 로딩 상태
  const [specSaveLoading, setSpecSaveLoading] = useState(false);

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
    baseLength: 50,
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
  // 첫 로드시에만 데이터 불러오기
  useEffect(() => {
    fetchTopLeftData();
  }, []);

  // topLeftData가 변경되었을 때 로컬 스토리지 확인
  useEffect(() => {
    if (topLeftData.length > 0) {
      // Get saved order ID from local storage
      const savedOrderId = localStorage.getItem('startSelectedOrderId');

      if (savedOrderId) {
        // Check if the saved ID exists in the current data
        const orderExists = topLeftData.some((order) => order.id === parseInt(savedOrderId));

        if (orderExists) {
          // Find the selected order data
          const selectedOrder = topLeftData.find((order) => order.id === parseInt(savedOrderId));

          // Restore state
          setSelectedOrderId(parseInt(savedOrderId));

          // Update specCodeDetailsMap
          setSpecCodeDetailsMap((prevState) => ({
            ...prevState,
            totalWeight: selectedOrder.totalWeight,
            totalQuantity: selectedOrder.totalQuantity,
          }));

          // Load top-right table data
          fetchTopRightData(parseInt(savedOrderId));
        }
      }
    }
  }, [topLeftData]);

  const handleOpenSpecModal = async () => {
    if (!selectedSpecCode) return; // specCode가 있어야 로직 실행
    setSpecModalOpen(true);

    try {
      const res = await axios.get('/api/item/specific');
      const allSpecs = res.data.table;

      // 1) 선택된 specCode(systemCode)로 현재 spec 객체 찾기
      const currentSpec = allSpecs.find((item) => item.systemCode === selectedSpecCode);
      if (!currentSpec) {
        console.warn('해당 systemCode를 찾을 수 없습니다:', selectedSpecCode);
        setSpecOptions([]);
        return;
      }

      // 2) currentSpec의 필드를 기준으로 allSpecs 필터링
      const filtered = allSpecs.filter((item) => {
        return (
          item.bbCode.split('-')[0] === currentSpec.bbCode.split('-')[0] &&
          item.cbCode === currentSpec.cbCode &&
          item.bWidth === currentSpec.bWidth &&
          item.cWidth === currentSpec.cWidth &&
          item.bladeThickness === currentSpec.bladeThickness
        );
      });

      console.log('필터된 spec 리스트:', filtered);
      setSpecOptions(filtered);
    } catch (e) {
      console.error('사양코드 목록 로드 실패:', e);
      setSpecOptions([]);
    }
  };

  const handleSpecSave = async () => {
    if (!selectedOrderId || !selectedTopRightId || !selectedSpecCode) return;
    setSpecSaveLoading(true);
    try {
      await axios.put(`/api/plan/order-details/${selectedOrderId}`, {
        specCode: selectedSpecCode,
        group_id: selectedTopRightId,
      });
      // 변경 후 테이블 리프레시
      fetchTopRightData(selectedOrderId);
      setSpecModalOpen(false);
    } catch (e) {
      console.error('사양코드 저장 실패:', e);
    } finally {
      setSpecSaveLoading(false);
    }
  };

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
      // 날짜 필드 가공: "2025-04-10T00:00:00" → "2025-04-10"
      const formatted = response.data.table.map((row) => ({
        ...row,
        orderDate: row.orderDate?.split('T')[0] || '',
        deliveryDate: row.deliveryDate?.split('T')[0] || '',
      }));
      setTopLeftData(formatted);
    } catch (error) {
      console.error('Error fetching top-left data:', error);
    }
  };

  const fetchTopRightData = async (orderId) => {
    try {
      setLoadingTopRight(true);

      // 1) 수주별 설정 한 번에 가져오기
      const { data: settings } = await axios.get(`/api/plan/settings/${orderId}`);
      // 2) 그룹별 항목 가져오기
      const { data: groupsRes } = await axios.get(`/api/plan/order-details/${orderId}/groups`);
      const groups = groupsRes.table;

      // 3) 각 그룹에 settings 필드 병합
      const processed = groups.map((item, idx) => ({
        ...item,
        id: item.groupNumber || idx,
        ...settings,
      }));

      setTopRightData(processed);
    } catch (error) {
      console.error('Error fetching top-right data:', error);
    } finally {
      setLoadingTopRight(false);
    }
  };

  const handleViewPastPlan = async () => {
    if (!selectedOrderId) return;
    const group_id_list = topRightData.map((item) => item.groupNumber).join(',');
    setBottomData([]);
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/plan/cutting-plan?order_id=${selectedOrderId}&group_id_list=${group_id_list}`,
      );
      const pastPlans = response.data.table;
      console.log(pastPlans);
      const summaryData = pastPlans.map((plan) => {
        const totalQuantity = Array.isArray(plan.result?.table)
          ? plan.result.table.reduce((sum, item) => sum + item.qty, 0)
          : 0;
        return {
          groupNumber: plan.group_id,
          totalQuantity,
          totalCB: plan.totalCB || 0,
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
      setBottomData(summaryData);
    } catch (error) {
      console.error('Error fetching past cutting plan:', error);
    } finally {
      setLoading(false);
    }
  };
  const handlePrintInNewWindow = async () => {
    function transformCode(code) {
      // Remove everything after dash if it exists
      const dashIndex = code.indexOf('-');
      let mainPart = code;
      if (dashIndex !== -1) {
        mainPart = code.substring(0, dashIndex);
      }

      // Find first digit index
      const firstDigitIndex = mainPart.search(/\d/);
      if (firstDigitIndex === -1) return code;

      // Get type part and numeric part
      const typePart = mainPart.substring(0, firstDigitIndex);
      const numericPart = mainPart.substring(firstDigitIndex);

      // Check if we have enough digits
      if (numericPart.length < 6) return code;

      // Parse length (first 3 digits)
      const lengthPart = parseInt(numericPart.substring(0, 3), 10);

      // Parse width part
      let widthPart;
      if (numericPart.length === 7 && numericPart.charAt(6) !== '0') {
        // Case like F0190045 (Format: Type + 3 digits length + 3 digits width + 1 digit decimal)
        const widthInt = parseInt(numericPart.substring(3, 6), 10);
        const widthDec = numericPart.substring(6, 7);
        widthPart = widthDec === '0' ? widthInt.toString() : `${widthInt}.${widthDec}`;

        // Return the format with 2 dimensions (length*width)
        return `${typePart}${lengthPart}*${widthPart}`;
      } else if (numericPart.length >= 9) {
        // Case like L030030030 or I060007040 (Format: Type + 3 digits length + 3 digits width + 3 digits height)
        const widthInt = parseInt(numericPart.substring(3, 6), 10);
        // For height, take the middle digit from the last 3 digits
        const heightPart = parseInt(numericPart.substring(7, 8), 10);

        // Return the format with 3 dimensions (length*width*height)
        return `${typePart}${lengthPart}*${widthInt}*${heightPart}`;
      } else {
        // Standard case (just use the original logic)
        const widthInt = parseInt(numericPart.substring(3, 6), 10);
        const widthDec = numericPart.length > 6 ? numericPart.substring(6, 7) : '0';
        widthPart = widthDec === '0' ? widthInt.toString() : `${widthInt}.${widthDec}`;

        return `${typePart}${lengthPart}*${widthPart}`;
      }
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
              margin: 10mm 5mm 10mm 5mm;
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
              margin: 0;
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
              line-height: 20px;
              font-weight: bold;
              height: 20px;
            }
            tr {
              height: 25px;
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">출력</button>
          ${(() => {
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
                        // L 절단 수량을 위한 변수 선언
                        let lCuttingQtyValue = row.lCuttingQty;

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
                          // 동일한 판번호 내에서 이전 행과 L 절단 번호가 같으면 L 절단 수량은 공백 처리
                          if (
                            rawPanel === prevRawPanel &&
                            row.lCuttingNumber === prevRow.lCuttingNumber
                          ) {
                            lCuttingQtyValue = '';
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
                            <tr${rowStyle}>
                              <td${leftCellStyle}>${globalIndex + 1}</td>
                              <td>${panelNumberValue}</td>
                              <td>${qtyValue}</td>
                              <td>${row.lCuttingNumber}</td>
                              <td>${orderNumberValue}</td>
                              <td>${customerValue}</td>
                              <td>${row.drawingNumber}</td>
                              <td>${row.id}</td>
                              <td>${Math.round(row.width_mm)}</td>
                              <td>${Math.round(row.length_mm)}</td>
                              <td>${Math.round(row.lep_mm)}</td>
                              <td>${Math.round(row.rep_mm)}</td>
                              <td>${lCuttingQtyValue}</td>
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
                          <td>${selectedGroup.totalQuantity || 'N/A'}</td>
                          <td>${totalLCuttingQty}</td>
                          <td>${selectedGroup.totalCB || 0}</td>
                          <td>${totalItemQty}</td>
                          <td colspan="8"></td>
                        </tr>
                      `
                        : '';
                    return `
                        <div class="page">
                          <div class="header" style="">
                            <h2 style="font-size: 1.4em; text-decoration: underline; text-align: center;">절단계획 상세 - 품목배치 리스트 (그룹번호: ${
                              selectedGroup.groupNumber
                            })</h2>
                           <div class="header-details" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
  <h2 style="font-size: 1.4em; margin: 0;">압접본수: ${selectedGroup.compressionSetting || '2'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">총중량: ${selectedGroup.result.totalWeight || '3'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">공차(+L: ${Number(selectedGroup.plusLAdjustment || '3.00').toFixed(2)} -L: ${Number(selectedGroup.minusLAdjustment || '-3.00').toFixed(2)} +W: ${Number(selectedGroup.plusWAdjustment || '3.00').toFixed(2)} -W: ${Number(selectedGroup.minusWAdjustment || '-3.00').toFixed(2)})</h2>
  </div>
<div class="header-details" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
  <h2 style="font-size: 1.4em; margin: 0;">BB: ${selectedGroup.bbCode ? transformCode(selectedGroup.bbCode) : 'N/A'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">길이: ${selectedGroup.bbCode.split('-')[1] || 'N/A'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">BP: ${selectedGroup.result.bWidth || 'N/A'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">CB: ${selectedGroup.cbCode ? transformCode(selectedGroup.cbCode) : 'N/A'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">CP: ${selectedGroup.result.cWidth || 'N/A'}</h2>
  <h2 style="font-size: 1.4em; margin: 0;">EB: ${transformCode(selectedGroup.result.ebCode) || 'SQ6*6'}</h2>
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
          })()}
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
    localStorage.setItem('startSelectedOrderId', orderId);
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

  const handleModalSave = async () => {
    if (!selectedOrderId) return;

    try {
      // 서버에 변경된 설정 저장
      await axios.put(`/api/plan/settings/${selectedOrderId}`, {
        compressionSetting,
        plusLAdjustment,
        minusLAdjustment,
        plusWAdjustment,
        minusWAdjustment,
        baseLength,
      });

      // 로컬 상태에도 반영
      setSpecCodeDetailsMap((prev) => ({
        ...prev,
        compressionSetting,
        plusLAdjustment,
        minusLAdjustment,
        plusWAdjustment,
        minusWAdjustment,
        baseLength,
      }));

      setTopRightData((prev) =>
        prev.map((row) => ({
          ...row,
          compressionSetting,
          plusLAdjustment,
          minusLAdjustment,
          plusWAdjustment,
          minusWAdjustment,
          baseLength,
        })),
      );

      setModalOpen(false);
    } catch (e) {
      console.error('설정 저장 오류:', e);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const [selectedTopRightId, setSelectedTopRightId] = useState(null);
  const [selectedSpecRow, setSelectedSpecRow] = useState(null);
  return (
    <PageContainer title="절단 계획 생성">
      <br />
      <Grid container spacing={2}>
        {/* 상단 왼쪽 테이블 */}
        <Grid item xs={5}>
          <ParentCard title="절단계획 생성 대상">
            <Box sx={{ height: 'calc(30vh - 32px)', width: '100%' }}>
              <StartDataGrid
                id="top-left-grid"
                rows={topLeftData}
                columns={topLeftColumns}
                columnHeaderHeight={45}
                disableSelectionOnClick
                rowsPerPageOptions={[topLeftData.length]}
                onRowClick={handleRowClick}
                selectionModel={selectedOrderId ? [selectedOrderId] : []}
                rowSelectionModel={selectedOrderId ? [selectedOrderId] : []}
                keepNonExistentRowsSelected={false}
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
              <Button
                disabled={
                  !selectedOrderId || topRightData.length === 0 || loadingTopRight || loading
                }
                onClick={handleViewPastPlan}
              >
                {loading ? <CircularProgress size={24} /> : '기계획 보기'}
              </Button>
              <Button onClick={() => setModalOpen(true)}>설정 변경</Button>
            </Stack>
          </ParentCard>
        </Grid>

        {/* 상단 오른쪽 테이블 */}
        <Grid item xs={7}>
          <ParentCard title="그룹별 계획조건 개별지정">
            <Box sx={{ height: 'calc(30vh - 32px)', width: '100%' }}>
              <StartDataGrid
                id="top-right-grid"
                rows={topRightData}
                columns={topRightColumns}
                getRowId={(row) => row.groupNumber}
                rowsPerPageOptions={[topRightData.length]}
                columnHeaderHeight={45}
                rowHeight={25}
                loading={loadingTopRight}
                onRowSelectionModelChange={(newModel) => {
                  const id = newModel[0];
                  setSelectedTopRightId(id);

                  // 선택된 행 객체 찾기
                  const row = topRightData.find((r) => r.groupNumber === id);
                  if (row) {
                    setSelectedSpecRow(row);
                    setSelectedSpecCode(row.specCode); // 여기서 specCode를 꺼내서 저장
                  } else {
                    setSelectedSpecRow(null);
                    setSelectedSpecCode('');
                  }
                }}
                rowSelectionModel={selectedTopRightId ? [selectedTopRightId] : []}
                selectedOrderId={selectedOrderId}
                sx={{
                  '& .MuiDataGrid-cell': { border: '1px solid black', fontSize: '12px', py: 0.5 },
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: '#B2B2B2',
                    fontSize: '12px',
                    border: '1px solid black',
                  },
                  '& .index-cell': { backgroundColor: '#B2B2B2' },
                }}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-start" spacing={1}>
              <Button disabled={!selectedTopRightId} onClick={handleOpenSpecModal}>
                사양코드 변경
              </Button>
            </Stack>
          </ParentCard>
        </Grid>
      </Grid>

      {/* 하단 테이블 */}
      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <ParentCard title="절단 계획 결과: 그룹별 사용자재">
            <Box sx={{ height: 'calc(30vh)', width: '100%' }}>
              <StartDataGrid
                id="bottom-grid"
                rows={bottomData}
                getRowId={(row) => row.groupNumber}
                onRowSelectionModelChange={(ids) => {
                  const selected = bottomData.find((row) => row.groupNumber === ids[0]);
                  setSelectedGroup(selected);
                }}
                columns={bottomColumns}
                columnHeaderHeight={30}
                rowsPerPageOptions={[bottomColumns.length]}
                rowHeight={25}
                selectionModel={selectedGroup ? [selectedGroup.groupNumber] : []} // Add this line
                rowSelectionModel={selectedGroup ? [selectedGroup.groupNumber] : []}
                keepNonExistentRowsSelected={false} // Add this
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
      <Dialog open={specModalOpen} onClose={() => setSpecModalOpen(false)}>
        <DialogTitle>사양코드 변경</DialogTitle>
        <DialogContent>
          <SearchableSelect
            label="사양코드 선택"
            options={specOptions}
            value={selectedSpecCode}
            onChange={(e) => setSelectedSpecCode(e.target.value)}
          />
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={() => setSpecModalOpen(false)}>취소</Button>
            <Button
              variant="contained"
              onClick={handleSpecSave}
              disabled={!selectedSpecCode || specSaveLoading}
              startIcon={specSaveLoading && <CircularProgress size={20} />}
            >
              저장
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>설정 변경</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* 압접본 설정 Select */}
            <Select
              label="압접본 설정"
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
            {/* baseLength 입력 필드 추가 */}
            <TextField
              label="기본 로스 (baseLength)"
              type="number"
              value={baseLength}
              onChange={(e) => setBaseLength(parseFloat(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleModalSave()}
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
