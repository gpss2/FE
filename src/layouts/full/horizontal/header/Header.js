import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  Modal,
  TextField,
  Button,
  useMediaQuery,
  Select,
  MenuItem,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import { IconMenu2, IconSettings } from '@tabler/icons';
import PropTypes from 'prop-types';
import axios from 'axios';
import Navigation from 'src/layouts/full/horizontal/navbar/Navbar';
import Language from 'src/layouts/full/vertical/header/Language';
import Profile from 'src/layouts/full/vertical/header/Profile';

const topRightColumns = [
  { field: 'compressionSetting', headerName: '압접\n본수\n설정', flex: 1 },
  { field: 'baseLength', headerName: '기본\n로스', flex: 1 },
  { field: 'plusLAdjustment', headerName: '+L\n공차', flex: 1 },
  { field: 'minusLAdjustment', headerName: '-L\n공차', flex: 1 },
  { field: 'plusWAdjustment', headerName: '+W\n공차', flex: 1 },
  { field: 'minusWAdjustment', headerName: '-W\n공차', flex: 1 },
  { field: 'effectiveWidthLength', headerName: '폭묶음 길이비(%)', flex: 1 },
  { field: 'iofdLimit', headerName: 'IOFD\n탐색제한\n(mm)', flex: 1 },
];

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    compressionSetting: '2본 기본',
    baseLength: 0,
    plusLAdjustment: 0,
    minusLAdjustment: 0,
    plusWAdjustment: 0,
    minusWAdjustment: 0,
    effectiveWidthLength: 0,
    iofdLimit: 0,
  });

  const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    margin: '0 auto',
    width: '100%',
    color: `${theme.palette.text.secondary} !important`,
  }));

  const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSaveSettings = async () => {
    try {
      await axiosInstance.put('/settings', settings);
      handleCloseModal();
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <>
      <AppBarStyled position="sticky" color="default" elevation={8}>
        <ToolbarStyled>
          <Box sx={{ width: lgDown ? '45px' : 'auto', overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: '24px',
                color: '#333fff',
                fontFamily: 'Galmuri9, sans-serif',
                fontWeight: 700,
              }}
            >
              GPSS II
            </h1>
          </Box>
          {lgDown && (
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={() => dispatch(toggleMobileSidebar())}
            >
              <IconMenu2 />
            </IconButton>
          )}
          {lgUp && <Navigation />}
          <Box flexGrow={1} />
          <Stack spacing={1} direction="row" alignItems="center">
            <Language />
            <IconButton color="inherit" onClick={handleOpenModal}>
              <IconSettings />
            </IconButton>
            <Profile />
          </Stack>
        </ToolbarStyled>
      </AppBarStyled>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2>Settings</h2>
          <Stack spacing={2}>
            <Select
              name="compressionSetting"
              value={settings.compressionSetting}
              onChange={handleInputChange}
            >
              <MenuItem value="2본 기본">2본 기본</MenuItem>
              <MenuItem value="2본 최적">2본 최적</MenuItem>
            </Select>
            {topRightColumns
              .filter((col) => col.field !== 'compressionSetting')
              .map((column) => (
                <TextField
                  key={column.field}
                  label={column.headerName.replace('\n', ' ')}
                  name={column.field}
                  type="number"
                  value={settings[column.field]}
                  onChange={handleInputChange}
                />
              ))}
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={handleSaveSettings}>
                Save
              </Button>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default Header;
