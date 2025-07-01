import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  Stack,
  Button,
  Typography,
  Modal,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../components/container/PageContainer';
import ParentCard from '../../../components/shared/ParentCard';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../../../components/shared/SearchableSelect';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MyDataGrid from './MyDataGrid';
import StartDataGrid from './StartDataGrid';

// 사양코드 선택 다이얼로그 컴포넌트
const SpecCodeDialog = ({ open, onClose, specCodes, onSelect, currentValue }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCodes = specCodes.filter((code) => {
    const term = searchTerm.toLowerCase();
    return (
      code.systemCode.toLowerCase().includes(term) ||
      code.bbCode.toLowerCase().includes(term) ||
      code.cbCode.toLowerCase().includes(term)
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>사양코드 선택</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>사양코드</TableCell>
                <TableCell>BB 코드</TableCell>
                <TableCell>CB 코드</TableCell>
                <TableCell>BB피치</TableCell>
                <TableCell>CB피치</TableCell>
                <TableCell>톱날두께</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCodes.length > 0 ? (
                filteredCodes.map((code) => (
                  <TableRow
                    key={code.systemCode}
                    hover
                    onClick={() => onSelect(code.systemCode)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor:
                        currentValue === code.systemCode ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                    }}
                  >
                    <TableCell>{code.systemCode}</TableCell>
                    <TableCell>{code.bbCode}</TableCell>
                    <TableCell>{code.cbCode}</TableCell>
                    <TableCell>{code.bWidth}</TableCell>
                    <TableCell>{code.cWidth}</TableCell>
                    <TableCell>{code.bladeThickness}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

// ==================== (1) 중량 계산 로직 추가 예시 함수 ====================
/**
 * 자재정보를 찾아주는 헬퍼 함수 (예시).
 * 실제로는 meterialCode 상태 등을 활용하거나,
 * 필요하다면 별도 API 호출 등을 통해 재질/무게/두께를 찾으세요.
 */
function findMaterial(materialCode, meterialCodeState) {
  // materialCodeState: [{ materialCode: 'END_BAR', weight: 7.85, maxWidth: 3, ...}, ...]
  // 위와 같은 식이라 가정
  return meterialCodeState.find((m) => m.materialCode === materialCode);
}

/**
 * 프론트엔드용 중량 계산 (백엔드 calculate_weights 로직 참조)
 * @param {Object} row - 그리드 한 행의 데이터
 * @param {Array} meterialCodeState - 자재 정보 (예: useState로 저장한 meterialCode)
 * @param {Array} specCodeState - 사양 정보 (예: useState로 저장한 specCode)
 * @returns {{ totalWeight: number, neWeight: number }} 계산된 중량
 */
function calculateGratingWeightsFrontEnd(row, meterialCodeState, specCodeState) {
  // 1) row에서 필요한 값 파싱
  const width_mm = parseFloat(row.width_mm) || 0;
  const length_mm = parseFloat(row.length_mm) || 0;
  const cb_count = parseInt(row.cbCount) || 0;
  const endBarCode = row.endBar || '';
  // quantity는 최종 중량에 곱해줄 때 사용 (아래에서 처리)

  // 2) specCode에서 bbCode, cbCode를 찾는다고 가정
  //    실제로는 row.specCode를 키로 해서 specCodeState에서 bbCode, cbCode를 얻어와야 함
  //    예: const specItem = specCodeState.find((s) => s.systemCode === row.specCode);
  //    여기서는 예시로 specItem.bbCode, specItem.cbCode를 얻었다고 가정
  const specItem = specCodeState.find((s) => s.systemCode === row.specCode);
  if (!specItem || !specItem.bbCode || !specItem.cbCode) {
    return { totalWeight: 0, neWeight: 0 };
  }

  // 3) 자재 정보 가져오기
  const bb_material = findMaterial(specItem.bbCode, meterialCodeState);
  const cb_material = findMaterial(specItem.cbCode, meterialCodeState);
  const eb_material = findMaterial(endBarCode, meterialCodeState);

  if (!bb_material || !cb_material || !eb_material) {
    // 자재 정보가 없으면 0 리턴 (실제 로직에서는 에러 처리)
    return { totalWeight: 0, neWeight: 0 };
  }

  // 4) BB 갯수 계산 (python 코드의 self.calculate_bb_count(width_mm))
  //    실제 로직이 없으므로, 예시로 '폭 / 30' 정도로 가정
  const bb_count = Math.floor(width_mm / 30) || 1;

  // 5) EB의 두께는 eb_material.maxWidth 사용
  const eb_thickness = parseFloat(eb_material.maxWidth) || 0;

  // 6) BB 무게
  //    (length_mm - eb_thickness * 2) / 1000: m 단위 길이
  const bb_length = (length_mm - eb_thickness * 2) / 1000;
  const bb_weight = bb_length * bb_material.weight * bb_count;

  // 7) CB 무게
  //    width_mm / 1000: m 단위 길이
  const cb_length = width_mm / 1000;
  const cb_weight = cb_length * cb_material.weight * cb_count;

  // 8) EB 무게
  //    EB는 양끝 2개
  const eb_length = width_mm / 1000;
  const eb_weight = eb_length * eb_material.weight * 2;

  // 9) 합산 후 반올림
  let total_weight = bb_weight + cb_weight + eb_weight;
  let ne_weight = total_weight - eb_weight;

  // 소수점 첫째자리 반올림 (python: self.mathematical_round(x, 1) 참고)
  total_weight = Math.round(total_weight * 10) / 10;
  ne_weight = Math.round(ne_weight * 10) / 10;

  return { totalWeight: total_weight, neWeight: ne_weight };
}

// ==================== (2) 전체 컴포넌트 코드 ====================
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const indexColumn = {
  field: 'index',
  headerName: '',
  width: 50,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  cellClassName: 'index-cell',
  renderCell: (params) => {
    const sortedRowIds = params.api.getSortedRowIds();
    return sortedRowIds.indexOf(params.id) + 1;
  },
};

const topColumns = [
  indexColumn,
  { field: 'taskNumber', headerName: '태스크번호', flex: 1 },
  { field: 'orderNumber', headerName: '수주번호', flex: 1 },
  { field: 'category', headerName: '구분', flex: 1 },
  { field: 'orderDate', headerName: '수주일자', flex: 1 },
  { field: 'customerCode', headerName: '수주처명', flex: 1 },
  { field: 'deliveryDate', headerName: '납기일자', flex: 1 },
  { field: 'totalQuantity', headerName: '총수량', flex: 1 },
  { field: 'totalWeight', headerName: '총중량(Kg)', flex: 1 },
];

// 하단 테이블 컬럼 정의
const bottomColumns = [
  {
    field: 'drawingNumber',
    headerName: '도면번호',
    editable: true,
    flex: 1,
    headerAlign: 'center',
  },
  {
    field: 'itemNo',
    headerName: '품목번호',
    editable: true,
    width: 100,
    headerAlign: 'center',
  },
  {
    field: 'itemType',
    headerName: '품목종류',
    editable: true,
    width: 100,
    headerAlign: 'center',
  },
  {
    field: 'itemName',
    headerName: '품명',
    editable: true,
    flex: 1,
    headerAlign: 'center',
  },
  {
    field: 'specCode',
    headerName: '사양코드',
    flex: 1,
    headerAlign: 'center',
  },
  {
    field: 'endBar',
    headerName: 'EndBar',
    flex: 1,
    headerAlign: 'center',
  },
  {
    field: 'width_mm',
    headerName: '폭\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'length_mm',
    headerName: '길이\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'cbCount',
    headerName: 'CB 수',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'lep_mm',
    headerName: 'LEP\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'rep_mm',
    headerName: 'REP\n(mm)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'quantity',
    headerName: '수량',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'weight_kg',
    headerName: '중량\n(Kg)',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'neWeight_kg',
    headerName: 'NE\n중량',
    editable: true,
    width: 60,
    headerAlign: 'center',
    align: 'center',
  },
];

const recalcValues = (newData, oldData, C_PITCH) => {
  // 어떤 필드가 변경되었는지 판별
  let source = '';
  if (newData.length_mm !== oldData.length_mm) {
    source = 'length_mm';
  } else if (newData.cbCount !== oldData.cbCount) {
    source = 'cbCount';
  } else if (newData.lep_mm !== oldData.lep_mm) {
    source = 'lep_mm';
  } else if (newData.rep_mm !== oldData.rep_mm) {
    source = 'rep_mm';
  } else {
    source = 'none';
  }
  console.log(source, C_PITCH);

  // 중간 계산에 사용할 변수들
  let length_mm, cbCount, lep, rep;
  let errorFlag = false;

  // **소수점 첫째 자리까지 사사오입(반올림)**을 위한 헬퍼 함수
  const roundToOne = (value) => {
    // value가 양수라고 가정할 때 Math.round는 반올림(사사오입) 동작을 수행한다.
    return Math.round(value * 10) / 10;
  };

  if (source === 'length_mm') {
    console.log('길이(length_mm) 수정됨');

    // 1) length_mm 계산 → 소수점 첫째 자리까지 반올림
    length_mm = Number(newData.length_mm);
    length_mm = roundToOne(length_mm);

    // 2) cbCount 재계산 (소수점 없는 정수)
    cbCount = Math.floor(length_mm / C_PITCH) + 1;

    // 3) lep, rep 계산
    let total = length_mm - (cbCount - 1) * C_PITCH;
    lep = total / 2;
    rep = total / 2;

    // lep/rep가 최소값(40mm)보다 작아질 때까지 CB 수 조정
    while ((lep < 40 || rep < 40) && cbCount > 1) {
      cbCount--;
      total = length_mm - (cbCount - 1) * C_PITCH;
      lep = total / 2;
      rep = total / 2;
    }

    // total이 200 이상이면 에러 플래그
    if (total >= 200) {
      errorFlag = true;
    }
    console.log('CB 수:', cbCount);

    // 4) lep, rep도 소수점 첫째 자리까지 반올림
    lep = roundToOne(lep);
    rep = roundToOne(rep);

  } else if (source === 'cbCount') {
    // 1) length_mm는 이전(oldData)을 그대로 사용 → 소수점 첫째 자리까지 반올림
    length_mm = Number(oldData.length_mm);
    length_mm = roundToOne(length_mm);

    // 2) 새로운 cbCount 값
    cbCount = Number(newData.cbCount);

    // 3) lep, rep 계산
    let total = length_mm - (cbCount - 1) * C_PITCH;
    lep = total / 2;
    rep = total / 2;

    // total이 200 이상이면 에러 플래그
    if (total >= 200) {
      errorFlag = true;
    }

    // lep, rep 값 반올림
    lep = roundToOne(lep);
    rep = roundToOne(rep);

  } else if (source === 'lep_mm') {
    // 1) length_mm는 이전(oldData)을 그대로 사용 → 반올림
    length_mm = Number(oldData.length_mm);
    length_mm = roundToOne(length_mm);

    // 2) cbCount도 이전 값을 가져옴
    cbCount = Number(oldData.cbCount);

    // 3) total 계산
    let total = length_mm - (cbCount - 1) * C_PITCH;

    // 4) 새로운 lep 값 (사용자가 입력한 값)
    let newLep = Number(newData.lep_mm);
    newLep = roundToOne(newLep);

    // 5) 새로운 rep 계산 및 CB 조정 로직
    let newRep = total - newLep;

    // lep가 C_PITCH를 넘어갈 경우 CB 감소
    if (newLep > C_PITCH || newLep > total) {
      cbCount -= 1;
      total = length_mm - (cbCount - 1) * C_PITCH;
      newRep = total - newLep;
    }
    // rep가 C_PITCH를 넘어갈 경우 CB 증가
    if (newRep > C_PITCH || newRep > total) {
      cbCount += 1;
      total = length_mm - (cbCount - 1) * C_PITCH;
      newRep = total - newLep;
    }

    // total이 200 이상이면 에러 플래그
    if (total >= 200) {
      errorFlag = true;
    }

    // lep, rep 반올림
    lep = roundToOne(newLep);
    rep = roundToOne(newRep);

  } else if (source === 'rep_mm') {
    // 1) length_mm는 이전(oldData)을 그대로 사용 → 반올림
    length_mm = Number(oldData.length_mm);
    length_mm = roundToOne(length_mm);

    // 2) cbCount도 이전 값
    cbCount = Number(oldData.cbCount);

    // 3) total 계산
    let total = length_mm - (cbCount - 1) * C_PITCH;

    // 4) 새로운 rep 값 (사용자 입력)
    let newRep = Number(newData.rep_mm);
    newRep = roundToOne(newRep);

    // 5) lep 계산 및 CB 조정 로직
    let newLep = total - newRep;

    // rep이 C_PITCH를 넘어갈 경우 CB 감소
    if (newRep > C_PITCH || newRep > total) {
      cbCount -= 1;
      total = length_mm - (cbCount - 1) * C_PITCH;
      newLep = total - newRep;
    }
    // lep이 C_PITCH를 넘어갈 경우 CB 증가
    if (newLep > C_PITCH || newLep > total) {
      cbCount += 1;
      total = length_mm - (cbCount - 1) * C_PITCH;
      newLep = total - newRep;
    }

    // total이 200 이상이면 에러 플래그
    if (total >= 200) {
      errorFlag = true;
    }

    // lep, rep 반올림
    lep = roundToOne(newLep);
    rep = roundToOne(newRep);

  } else {
    // 아무 변경사항이 없으면 단순 병합 후 반환
    return { ...oldData, ...newData };
  }

  // 최종 객체 반환 시에도 length_mm, lep_mm, rep_mm을 소수점 첫째 자리까지 반올림한 값으로 채워서 리턴
  return {
    ...newData,
    length_mm: roundToOne(length_mm),
    cbCount: cbCount,
    lep_mm: roundToOne(lep),
    rep_mm: roundToOne(rep),
    error: errorFlag,
  };
};



// Add imports and existing code...

const Condition = () => {
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState('');
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // ----------------------
  // 자재정보 / 사양정보 등
  // ----------------------
  const [meterialCode, setMeterialCode] = useState([]);
  const [specCode, setSpecCode] = useState([]);
  const [standardItems, setStandardItems] = useState([]); // 품명 목록 상태 추가

  const navigate = useNavigate();
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [applyLoading, setApplyLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedSpecific, setSelectedSpecific] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [templateDownloaded, setTemplateDownloaded] = useState(false);

  // 사양코드 선택 다이얼로그 상태
  const [mainSpecCodeDialogOpen, setMainSpecCodeDialogOpen] = useState(false);
  const [templateSpecCodeDialogOpen, setTemplateSpecCodeDialogOpen] = useState(false);

  // axios 인터셉터
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

  // 초기 데이터 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
      return;
    }

    fetchTopData();
    fetchMeterialCode();
    fetchSpecCode();
    fetchStandardItems();
  }, [navigate]);

  // 상단 테이블 데이터를 불러온 후 로컬 스토리지에서 선택된 행 정보 복원
  useEffect(() => {
    if (topData.length > 0) {
      // 로컬 스토리지에서 선택된 주문 ID와 번호 가져오기
      const savedOrderId = localStorage.getItem('selectedOrderId');
      const savedOrderNumber = localStorage.getItem('selectedOrderNumber');

      if (savedOrderId) {
        // 저장된 ID가 현재 데이터에 존재하는지 확인
        const orderExists = topData.some((order) => order.id === parseInt(savedOrderId));

        if (orderExists) {
          // 저장된 ID가 존재하면 상태 복원
          setSelectedOrderId(parseInt(savedOrderId));
          setSelectedOrderNumber(savedOrderNumber || '');

          // 하단 테이블 데이터 불러오기
          fetchBottomData(parseInt(savedOrderId));
        }
      }
    }
  }, [topData]);

  const fetchTopData = async () => {
    try {
      const response = await axios.get('/api/order/list');
      const processedData = response.data.table.map((row) => ({
        ...row,
        orderDate: row.orderDate.split('T')[0],
        deliveryDate: row.deliveryDate.split('T')[0],
      }));
      setTopData(processedData);
    } catch (error) {
      console.error('Error fetching top data:', error);
    }
  };

  const fetchMeterialCode = async () => {
    try {
      const response = await axios.get('/api/item/material');
      setMeterialCode(response.data.table);
    } catch (error) {
      console.error('Error fetching material data:', error);
    }
  };

  const fetchSpecCode = async () => {
    try {
      const response = await axios.get('/api/item/specific');
      setSpecCode(response.data.table);
    } catch (error) {
      console.error('Error fetching spec data:', error);
    }
  };

  const fetchStandardItems = async () => {
    try {
      const response = await axios.get('/api/item/standard');
      setStandardItems(response.data.table);
    } catch (error) {
      console.error('Error fetching standard items:', error);
    }
  };

  // 하단 테이블 데이터 불러오기
  const fetchBottomData = async (orderId) => {
    try {
      const response = await axios.get(`/api/plan/order-details/${orderId}`);
      let processedData = response.data.table.map((row, index) => ({
        ...row,
        orderNumber: index + 1,
      }));
      let lastDrawingNumber = null;
      let group = 0;
      processedData = processedData.map((row) => {
        if (row.drawingNumber !== lastDrawingNumber) {
          group = group === 0 ? 1 : 0;
          lastDrawingNumber = row.drawingNumber;
        }
        return { ...row, group };
      });
      setBottomData(processedData);
    } catch (error) {
      console.error('Error fetching bottom data:', error);
    }
  };

  // ====================
  // 이벤트 핸들러들
  // ====================
  const handleRowClick = (params) => {
    const orderId = params.id;
    const orderNumber = params.row.taskNumber;

    // 상태 업데이트
    setSelectedOrderId(orderId);
    setSelectedOrderNumber(orderNumber);

    // 로컬 스토리지에 저장
    localStorage.setItem('selectedOrderId', orderId);
    localStorage.setItem('selectedOrderNumber', orderNumber);

    // 하단 테이블 데이터 불러오기
    fetchBottomData(orderId);
  };

  // 셀 더블클릭 시 모달(사양코드, EndBar, 품명 등) 편집
  const handleCellDoubleClick = (params) => {
    const { field, row } = params;
    if (['specCode', 'endBar', 'itemType', 'itemName'].includes(field)) {
      setModalData(row);
      setModalOpen(true);
    }
  };

  // 엔터키로 오른쪽 셀 이동
  const handleCellKeyDown = (params, event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentColIndex = bottomColumns.findIndex((col) => col.field === params.field);
      if (currentColIndex >= 0 && currentColIndex < bottomColumns.length - 1) {
        const nextCol = bottomColumns[currentColIndex + 1];
        const nextCell = document.querySelector(
          `[data-id="${params.id}"][data-field="${nextCol.field}"]`,
        );
        if (nextCell) {
          nextCell.click();
          nextCell.focus();
        }
      }
    }
  };

  // 새 행 추가
  const handleAddRow = () => {
    let newDrawingNumber = '01';
    let newSpecCode = '';
    let newEndBar = '';
    if (bottomData.length > 0) {
      newDrawingNumber = bottomData[bottomData.length - 1].drawingNumber;
      newSpecCode = bottomData[bottomData.length - 1].specCode;
      newEndBar = bottomData[bottomData.length - 1].endBar;
    }
    const sameDrawingRows = bottomData.filter((row) => row.drawingNumber === newDrawingNumber);
    let newItemNo;
    if (sameDrawingRows.length > 0) {
      const maxItemNo = Math.max(...sameDrawingRows.map((row) => Number(row.itemNo) || 0));
      newItemNo = String(maxItemNo + 1);
    } else {
      newItemNo = '1';
    }
    const newRow = {
      id: 'new_' + new Date().getTime(),
      drawingNumber: newDrawingNumber,
      itemNo: newItemNo,
      itemType: 'R', // 기본값
      itemName: 'SteelGrating', // 기본값
      specCode: newSpecCode,
      endBar: newEndBar,
      width_mm: 0,
      length_mm: 0,
      cbCount: 0,
      lep_mm: 0,
      rep_mm: 0,
      quantity: 0,
      weight_kg: 0,
      neWeight_kg: 0,
      error: false,
    };
    setBottomData([...bottomData, newRow]);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setModalData(null);
  };

  // 모달 사양코드 선택 다이얼로그 열기
  const handleOpenMainSpecCodeDialog = () => {
    setMainSpecCodeDialogOpen(true);
  };

  // 메인 다이얼로그에서 사양코드 선택
  const handleSelectMainSpecCode = (code) => {
    setModalData((prev) => ({
      ...prev,
      specCode: code,
    }));
    setMainSpecCodeDialogOpen(false);
  };

  // 모달 저장 (specCode, endBar, itemType, itemName)
  const handleSaveModal = () => {
    const { id, specCode, endBar, itemType, itemName } = modalData;
    const updatedRow = { ...modalData, specCode, endBar, itemType, itemName };
    setPendingUpdates((prev) => ({ ...prev, [id]: updatedRow }));
    setBottomData((prev) => prev.map((row) => (row.id === id ? updatedRow : row)));
    setModalOpen(false);
  };

  // 삭제
  const handleDelete = () => {
    if (!selectedDetailId) return;
    axios
      .delete(`/api/plan/order-details/${selectedOrderId}/${selectedDetailId}`)
      .then(() => {
        fetchBottomData(selectedOrderId);
        setBottomData((prev) => prev.filter((row) => row.id !== selectedDetailId));
        setSelectedDetailId(null);
      })
      .catch((error) => console.error('Error deleting row:', error));
  };

  // 전체 삭제
  const handleDeleteAll = () => {
    if (!selectedOrderId) return;
    axios
      .delete(`/api/plan/order-details/${selectedOrderId}`)
      .then(() => {
        setBottomData([]);
        fetchTopData();
        alert('전체 삭제가 완료되었습니다.');
      })
      .catch((error) => console.error('Error deleting all rows:', error));
  };

  // 템플릿 모달 열기/닫기
  const handleTemplateModalOpen = () => {
    setTemplateModalOpen(true);
    setSelectedSpecific('');
    setSelectedMaterial('');
    setTemplateDownloaded(false);
  };
  const handleTemplateModalClose = () => {
    setTemplateModalOpen(false);
    setSelectedSpecific('');
    setSelectedMaterial('');
    setTemplateDownloaded(false);
  };

  // 템플릿 사양코드 선택 다이얼로그 열기
  const handleOpenTemplateSpecCodeDialog = () => {
    setTemplateSpecCodeDialogOpen(true);
  };

  // 템플릿 다이얼로그에서 사양코드 선택
  const handleSelectTemplateSpecCode = (code) => {
    setSelectedSpecific(code);
    setTemplateSpecCodeDialogOpen(false);
  };

  // 템플릿 다운로드
  const handleDownloadTemplate = async () => {
    const specificItem = specCode.find((item) => item.systemCode === selectedSpecific);
    const materialItem = meterialCode.find((item) => item.materialCode === selectedMaterial);
    if (!specificItem || !materialItem) {
      console.error('선택한 사양코드 또는 EndBar 항목을 찾을 수 없습니다.');
      return;
    }
    try {
      const response = await axios.get(
        `/api/plan/order-details/${selectedOrderId}/excel-template`,
        {
          params: {
            specific_id: specificItem.id,
            material_id: materialItem.id,
          },
          responseType: 'blob',
        },
      );
      const selectedOrder = topData.find((order) => order.id === selectedOrderId);
      const fileName = selectedOrder
        ? `${selectedOrder.orderNumber}-${selectedOrder.customerCode}.xlsx`
        : 'excel-template.xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTemplateDownloaded(true);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  // 현재 데이터 다운로드
  const handleCurrentDataDownload = async () => {
    if (!selectedOrderId) return;
    try {
      const response = await axios.get(`/api/plan/order-details/${selectedOrderId}/excel`, {
        responseType: 'blob',
      });
      const selectedOrder = topData.find((order) => order.id === selectedOrderId);
      const fileName = selectedOrder
        ? `${selectedOrder.orderNumber}-${selectedOrder.customerCode}.xlsx`
        : '현재데이터.xlsx';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('현재 데이터 다운로드 중 에러:', error);
    }
  };

  // 템플릿 업로드
  const handleTemplateUpload = async (event) => {
    if (!selectedOrderId) return;
    const file = event.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`/api/plan/order-details/${selectedOrderId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchBottomData(selectedOrderId);
      await fetchTopData();
      setTemplateDownloaded(false);
      setTemplateModalOpen(false);
    } catch (error) {
      console.error('Error uploading modified template:', error);
    }
    setUploadLoading(false);
  };

  // ====================
  // (중요) 행 변경 시 최종 계산 처리
  // ====================
  const handleProcessRowUpdate = (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow;

    // 1) 기존 LEP/REP 재계산
    const currentSpec = specCode.find((item) => item.systemCode === newRow.specCode);
    const C_PITCH = currentSpec ? currentSpec.cWidth : 100;
    const recalculatedRow = recalcValues(newRow, oldRow, C_PITCH);

    // 2) 중량 계산 (수량 반영)
    const { totalWeight, neWeight } = calculateGratingWeightsFrontEnd(
      recalculatedRow,
      meterialCode,
      specCode,
    );
    const quantity = parseFloat(recalculatedRow.quantity) || 0;
    // 수량 * 단품 무게
    const totalW = (totalWeight * quantity).toFixed(1);
    const neW = (neWeight * quantity).toFixed(1);

    // 3) row에 반영
    const finalRow = {
      ...recalculatedRow,
      weight_kg: totalW, // 테이블에서 사용하는 weight_kg
      neWeight_kg: neW, // 테이블에서 사용하는 neWeight_kg
    };

    setPendingUpdates((prev) => ({ ...prev, [finalRow.id]: finalRow }));
    return finalRow;
  };

  // 적용 버튼 클릭 시 서버에 저장
  const handleBulkSave = async () => {
    setApplyLoading(true);
    const invalidMessages = [];
    // bottomData 배열을 순회하면서 각 행에 대해 에러 체크를 진행
    const updatedBottomData = bottomData.map((row, index) => {
      // pendingUpdates가 있으면 해당 업데이트 내용을 병합
      const updatedRow = pendingUpdates[row.id] ? { ...row, ...pendingUpdates[row.id] } : row;
      let hasError = false;
      const requiredFields = ['itemType', 'itemName', 'specCode', 'endBar'];

      // 필수 필드 빈 값 체크
      requiredFields.forEach((field) => {
        if (!updatedRow[field] || updatedRow[field].toString().trim() === '') {
          invalidMessages.push(`인덱스 ${index + 1} 에 대해 누락된 값이 있습니다. (${field})`);
          hasError = true;
        }
      });

      // LEP+REP >= 200 에러 처리
      const sum = Number(updatedRow.lep_mm) + Number(updatedRow.rep_mm);
      if (sum >= 200) {
        invalidMessages.push(`인덱스 ${index + 1} (품목번호: ${updatedRow.itemNo}) - 잘못된 입력`);
        hasError = true;
      }

      return { ...updatedRow, error: hasError };
    });

    // 에러가 있다면 저장 중단
    if (invalidMessages.length > 0) {
      setBottomData(updatedBottomData);
      alert(invalidMessages.join('\n'));
      setApplyLoading(false);
      return;
    }

    try {
      const updates = Object.values(pendingUpdates);
      const updatePromises = updates.map((row) => {
        // POST 요청일 경우 (신규 항목)
        if (String(row.id).startsWith('new_')) {
          // 1. row 객체에서 id와 error를 제외한 나머지만 payload 객체로 복사합니다.
          const { id, error, ...payload } = row;
    
          // 2. payload 객체의 값들을 순회하며 숫자형 문자열을 실제 숫자로 변환합니다.
          Object.keys(payload).forEach(key => {
            const value = payload[key];
            // 값이 비어있지 않은 문자열이고, 숫자로 변환했을 때 NaN이 아니면 변환합니다.
            if (key !== 'drawingNumber' && typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
              payload[key] = Number(value);
            }
          });
          
          // 3. 가공된 payload를 전송합니다.
          return axios.post(`/api/plan/order-details/${selectedOrderId}`, payload);
        } 
        // PUT 요청일 경우 (기존 항목 수정)
        else {
          return axios.put(`/api/plan/order-details/${selectedOrderId}/${row.id}`, row);
        }
      });
    
      await Promise.all(updatePromises);
      await fetchBottomData(selectedOrderId);
      await fetchTopData();
      setPendingUpdates({});
      alert('적용되었습니다.');
    } catch (error) {
      console.error('Error saving updates:', error);
    }
    setApplyLoading(false);
  };

  // ====================
  // 렌더링
  // ====================
  return (
    <div>
      <PageContainer title="수주 및 품목 관리">
        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard title="수주 선택">
              <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
                <StartDataGrid
                  rows={topData}
                  columns={topColumns}
                  columnHeaderHeight={30}
                  rowHeight={25}
                  onRowClick={handleRowClick}
                  // Use both props to support different MUI DataGrid versions
                  selectionModel={selectedOrderId ? [selectedOrderId] : []}
                  rowSelectionModel={selectedOrderId ? [selectedOrderId] : []}
                  // Enable single selection and show that a row is selected
                  keepNonExistentRowsSelected={false}
                  sx={{
                    '& .MuiDataGrid-cell': {
                      border: '1px solid black',
                      fontSize: '12px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      fontSize: '14px',
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
                    // 선택된 행에 대한 스타일 강화
                    '& .Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12) !important',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.2) !important',
                      },
                    },
                  }}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" mb={1} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<UploadFileIcon />}
                  disabled={!selectedOrderId || uploadLoading}
                  onClick={handleTemplateModalOpen}
                >
                  {uploadLoading ? <CircularProgress size={24} color="inherit" /> : 'BOM 생성'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCurrentDataDownload}
                  disabled={!selectedOrderId}
                >
                  BOM Export
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} mt={3}>
            <ParentCard
              title={`수주별 품목명세 입력 화면 ${selectedOrderNumber ? selectedOrderNumber : ''}`}
            >
              <Box sx={{ height: 'calc(50vh)', width: '100%' }}>
                <MyDataGrid
                  rows={bottomData}
                  columns={bottomColumns}
                  processRowUpdate={handleProcessRowUpdate}
                  onRowUpdate={(updatedRow) =>
                    setBottomData((prev) =>
                      prev.map((row) => (row.id === updatedRow.id ? updatedRow : row)),
                    )
                  }
                  onRowClick={(row) => setSelectedDetailId(row.id)}
                  onCellDoubleClick={handleCellDoubleClick}
                  onCellKeyDown={handleCellKeyDown}
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" mb={1} spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleBulkSave}
                  disabled={Object.keys(pendingUpdates).length === 0 || applyLoading}
                >
                  {applyLoading ? <CircularProgress size={24} color="inherit" /> : '적용'}
                </Button>
                <Button
                  variant="contained"
                  component="label"
                  disabled={!selectedOrderId || uploadLoading}
                >
                  {uploadLoading ? <CircularProgress size={24} color="inherit" /> : 'BOM 업로드'}
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    onChange={handleTemplateUpload}
                  />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!selectedOrderId}
                  onClick={handleAddRow}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={!selectedDetailId}
                >
                  삭제
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAll}
                  disabled={!selectedOrderId}
                >
                  전체 삭제
                </Button>
              </Stack>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>

      {/* ==================== 모달 (specCode, endBar 등 수정) ==================== */}
      {modalData && (
        <Modal open={isModalOpen} onClose={handleModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              데이터 수정
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <SearchableSelect
                  label="품목 종류"
                  options={[
                    'R',
                    'C',
                    'Angle 대',
                    'Angle 소',
                    'EndBar',
                    'GB',
                    '각 Pipe',
                    '특수 Type',
                  ]}
                  value={modalData.itemType}
                  onChange={(e) => setModalData((prev) => ({ ...prev, itemType: e.target.value }))}
                />
              </Grid>
              <Grid item xs={3}>
                <SearchableSelect
                  label="품명"
                  options={['SteelGrating', ...standardItems.map((row) => row.itemName)]}
                  value={modalData.itemName}
                  onChange={(e) => setModalData((prev) => ({ ...prev, itemName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={3}>
                {/* 사양코드 - 직접 구현한 버튼/텍스트 필드 조합으로 대체 */}
                <Typography variant="body2" mb={1}>
                  사양코드
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    value={modalData.specCode || ''}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleOpenMainSpecCodeDialog}
                    sx={{ ml: 1, height: '40px' }}
                  >
                    선택
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <SearchableSelect
                  label="EndBar"
                  options={meterialCode.map((row) => row.materialCode)}
                  value={modalData.endBar}
                  onChange={(e) => setModalData((prev) => ({ ...prev, endBar: e.target.value }))}
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={handleModalClose}>
                취소
              </Button>
              <Button variant="contained" onClick={handleSaveModal}>
                저장
              </Button>
            </Stack>
          </Box>
        </Modal>
      )}

      {/* ==================== 템플릿 모달 ==================== */}
      {isTemplateModalOpen && (
        <Modal open={isTemplateModalOpen} onClose={handleTemplateModalClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" mb={2}>
              수주번호 "{selectedOrderNumber}" 에서 사용할 사양코드와 EndBar를 선택해주세요.
            </Typography>
            <Stack spacing={2}>
              {/* 템플릿 모달의 사양코드 선택 UI */}
              <Typography variant="body2" mb={1}>
                사양코드
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={selectedSpecific || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleOpenTemplateSpecCodeDialog}
                  sx={{ ml: 1, height: '40px' }}
                >
                  선택
                </Button>
              </Box>

              <SearchableSelect
                label="EndBar"
                options={meterialCode.map((row) => row.materialCode)}
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={handleTemplateModalClose}>
                취소
              </Button>
              <Button
                variant="contained"
                onClick={handleDownloadTemplate}
                disabled={!selectedSpecific || !selectedMaterial}
              >
                양식 다운로드
              </Button>
            </Stack>
          </Box>
        </Modal>
      )}

      {/* 메인 모달용 사양코드 선택 다이얼로그 */}
      <SpecCodeDialog
        open={mainSpecCodeDialogOpen}
        onClose={() => setMainSpecCodeDialogOpen(false)}
        specCodes={specCode}
        onSelect={handleSelectMainSpecCode}
        currentValue={modalData?.specCode || ''}
      />

      {/* 템플릿 모달용 사양코드 선택 다이얼로그 */}
      <SpecCodeDialog
        open={templateSpecCodeDialogOpen}
        onClose={() => setTemplateSpecCodeDialogOpen(false)}
        specCodes={specCode}
        onSelect={handleSelectTemplateSpecCode}
        currentValue={selectedSpecific}
      />
    </div>
  );
};

export default Condition;
