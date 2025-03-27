import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  TextField,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';

const SearchableSelect = ({ label, options, value, onChange }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    setSearchValue(event.target.value.toLowerCase());
  };

  // 객체 형태의 옵션인지 확인
  const isObjectOption = options.length > 0 && typeof options[0] === 'object';

  // 테이블 형태로 표시해야 하는지 확인 (specCode 항목처럼 bbCode, cbCode 등을 포함하는 경우)
  const isTableView = isObjectOption && options[0].systemCode !== undefined;

  // 필터링된 옵션 생성
  const filteredOptions = options.filter((option) => {
    if (typeof option === 'string') {
      return option.toLowerCase().includes(searchValue);
    } else if (typeof option === 'object') {
      // 테이블 형태인 경우
      if (isTableView) {
        return (
          (option.systemCode || '').toLowerCase().includes(searchValue) ||
          (option.bbCode || '').toLowerCase().includes(searchValue) ||
          (option.cbCode || '').toLowerCase().includes(searchValue)
        );
      }
      // 일반 객체 형태인 경우
      else {
        return (option.label || '').toLowerCase().includes(searchValue);
      }
    }
    return false;
  });

  // 선택된 값의 표시 이름 찾기
  const getDisplayValue = () => {
    if (!value) return label;

    if (isTableView) {
      const selectedOption = options.find((option) => option.systemCode === value);
      return selectedOption ? selectedOption.systemCode : value;
    } else if (isObjectOption) {
      const selectedOption = options.find((option) => option.value === value);
      return selectedOption ? selectedOption.label : value;
    }

    return value;
  };

  // 테이블 행 클릭 처리 - 이벤트 전파 중지 추가
  const handleTableRowClick = (event, systemCode) => {
    event.stopPropagation(); // 이벤트 전파 중지
    event.preventDefault(); // 기본 동작 방지
    console.log('Row clicked with system code:', systemCode);

    // Select 메뉴 닫기를 위해 setTimeout 사용
    setTimeout(() => {
      onChange({ target: { value: systemCode } });
    }, 100);
  };

  return (
    <Box>
      <Typography variant="body2" mb={1}>
        {label}
      </Typography>
      <Select
        value={value || ''}
        onChange={onChange}
        displayEmpty
        fullWidth
        MenuProps={{
          autoFocus: false,
          PaperProps: {
            style: {
              maxHeight: 450,
              width: isTableView ? 550 : 'auto', // 테이블 형태일 때 더 넓게
            },
          },
        }}
        renderValue={getDisplayValue}
      >
        <ListSubheader>
          <TextField
            size="small"
            placeholder="검색"
            fullWidth
            autoFocus
            onChange={handleSearch}
            onKeyDown={(e) => e.stopPropagation()} // 자동 선택 방지
          />
        </ListSubheader>

        {isTableView ? (
          // 테이블 형태로 표시 (specCode 항목 등)
          <Box onClick={(e) => e.stopPropagation()}>
            <TableContainer component={Paper} style={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="33%">사양코드</TableCell>
                    <TableCell width="33%">BB코드</TableCell>
                    <TableCell width="33%">CB코드</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <TableRow
                        key={index}
                        onClick={(e) => handleTableRowClick(e, option.systemCode)}
                        hover
                        style={{
                          cursor: 'pointer',
                          backgroundColor:
                            value === option.systemCode ? 'rgba(25, 118, 210, 0.12)' : 'inherit',
                        }}
                      >
                        <TableCell>{option.systemCode}</TableCell>
                        <TableCell>{option.bbCode}</TableCell>
                        <TableCell>{option.cbCode}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        검색 결과 없음
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : // 일반 드롭다운 형태로 표시
        filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <MenuItem key={index} value={typeof option === 'object' ? option.value : option}>
              {typeof option === 'object' ? option.label : option}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>검색 결과 없음</MenuItem>
        )}
      </Select>
    </Box>
  );
};

export default SearchableSelect;
