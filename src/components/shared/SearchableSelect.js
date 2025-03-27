import React, { useState } from 'react';
import { Select, MenuItem, TextField, ListSubheader } from '@mui/material';

const SearchableSelect = ({ label, options, value, onChange }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    setSearchValue(event.target.value.toLowerCase());
  };

  // 옵션이 객체라면 option.label을, 문자열이면 option 자체를 사용
  const filteredOptions = options.filter((option) => {
    const text = typeof option === 'object' ? option.label : option;
    return text.toLowerCase().includes(searchValue);
  });

  return (
    <Select
      value={value}
      onChange={onChange}
      displayEmpty
      fullWidth
      MenuProps={{ autoFocus: false }}
      renderValue={(selected) => (selected ? selected : label)}
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
      {filteredOptions.length > 0 ? (
        filteredOptions.map((option, index) => (
          <MenuItem key={index} value={typeof option === 'object' ? option.value : option}>
            {typeof option === 'object' ? option.label : option}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>검색 결과 없음</MenuItem>
      )}
    </Select>
  );
};

export default SearchableSelect;
