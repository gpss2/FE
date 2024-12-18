import React, { useState } from 'react';
import { Select, MenuItem, TextField, ListSubheader } from '@mui/material';

const SearchableSelect = ({ label, options, value, onChange }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    setSearchValue(event.target.value.toLowerCase());
  };

  const filteredOptions = options.filter((option) => option.toLowerCase().includes(searchValue));

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
          <MenuItem key={index} value={option}>
            {option}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>검색 결과 없음</MenuItem>
      )}
    </Select>
  );
};

export default SearchableSelect;
