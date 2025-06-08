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
import logo from 'src/assets/images/gpss2/logo.jpeg';

const topRightColumns = [
  { field: 'initialCuttingPointLB', headerName: '기본 로스(mm)', flex: 1 },
  { field: 'panelWidthUB', headerName: '제작 가능한 패널의 최대 폭(mm)', flex: 1 },
  { field: 'initialWeldingPointLB', headerName: '최초 압접 지점 하한(mm)', flex: 1 },
  { field: 'initialWeldingPointUB', headerName: '최초 압접 지점 상한(mm)', flex: 1 },
  { field: 'weldingAdjustmentLB', headerName: '압접 지점 조정 하한(mm)', flex: 1 },
  { field: 'weldingAdjustmentUB', headerName: ' 압접 지점 조정 상한(mm)', flex: 1 },
  {
    field: 'weldingAndCuttingGapLB',
    headerName: ' 압접 지점과 절단 지점 간의 최소 간격(mm)',
    flex: 1,
  },
];

const Header = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    initialCuttingPointLB: '2본 기본',
    panelWidthUB: 0,
    initialWeldingPointLB: 0,
    initialWeldingPointUB: 0,
    weldingAdjustmentLB: 0,
    weldingAdjustmentUB: 0,
    weldingAndCuttingGapLB: 0,
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
          <Box sx={{ width: lgDown ? '160px' : 'auto', overflow: 'hidden' }}>
            <img src={logo}></img>
          </Box>
          <Navigation />
          <Box flexGrow={1} />
          <Stack spacing={1} direction="row" alignItems="center">
            {/* <Language /> */}
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
          <h2>머신 파라미터 세팅</h2>
          <Stack spacing={2}>
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
