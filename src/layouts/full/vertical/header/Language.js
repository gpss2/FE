import React from 'react';
import { Avatar, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from 'src/store/customizer/CustomizerSlice';
import FlagEn from 'src/assets/images/flag/icon-flag-en.svg';
import FlagTw from 'src/assets/images/flag/icon-flag-tw.svg';
import FlagCn from 'src/assets/images/flag/icon-flag-cn.svg';
import FlagTh from 'src/assets/images/flag/icon-flag-th.svg';
import FlagVn from 'src/assets/images/flag/icon-flag-vn.svg';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const Languages = [
  {
    flagname: 'English',
    icon: FlagEn,
    value: 'en',
  },
  {
    flagname: 'Chinese Simplified',
    icon: FlagCn,
    value: 'zh-CN',
  },
  {
    flagname: 'Taiwan',
    icon: FlagTw, // 대만 국기 아이콘
    value: 'zh-TW',
  },
  {
    flagname: 'Thai',
    icon: FlagTh, // 태국 국기 아이콘
    value: 'th',
  },
  {
    flagname: 'Vietnamese',
    icon: FlagVn, // 베트남 국기 아이콘
    value: 'vi',
  },
];
const Language = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);
  const customizer = useSelector((state) => state.customizer);
  const currentLang =
    Languages.find((_lang) => _lang.value === customizer.isLanguage) || Languages[1];
  const { i18n } = useTranslation();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    i18n.changeLanguage(customizer.isLanguage);
  }, []);

  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Avatar src={currentLang.icon} alt={currentLang.value} sx={{ width: 20, height: 20 }} />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        {Languages.map((option, index) => (
          <MenuItem
            key={index}
            sx={{ py: 2, px: 3 }}
            onClick={() => dispatch(setLanguage(option.value))}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={option.icon} alt={option.icon} sx={{ width: 20, height: 20 }} />
              <Typography> {option.flagname}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Language;
