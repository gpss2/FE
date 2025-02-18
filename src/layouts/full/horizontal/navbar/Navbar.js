import { useMediaQuery, Box, Drawer, Container } from '@mui/material';
import NavListing from './NavListing/NavListing';
import Logo from '../../shared/logo/Logo';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import SidebarItems from '../../vertical/sidebar/SidebarItems';

const Navigation = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();

  if (lgUp || true) {
    // 이게 맞나 싶긴한데 일단 기한이 얼마 안남았으니 땜빵쳐놓자
    return (
      <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }} py={2}>
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Container
          sx={{
            maxWidth: customizer.isLayout === 'boxed' ? 'lg' : '100%!important',
          }}
        >
          <NavListing />
        </Container>
      </Box>
    );
  }

  // return (
  //   <Drawer
  //     anchor="left"
  //     open={customizer.isMobileSidebar}
  //     onClose={() => dispatch(toggleMobileSidebar())}
  //     variant="temporary"
  //     PaperProps={{
  //       sx: {
  //         width: customizer.SidebarWidth,
  //         backgroundColor:
  //           customizer.activeMode === 'dark'
  //             ? customizer.darkBackground900
  //             : customizer.activeSidebarBg,
  //         color: customizer.activeSidebarBg === '#ffffff' ? '' : 'white',
  //         border: '0 !important',
  //         boxShadow: (theme) => theme.shadows[8],
  //       },
  //     }}
  //   >
  //     <h1>??</h1>
  //     {/* ------------------------------------------- */}
  //     {/* Logo */}
  //     {/* ------------------------------------------- */}
  //     <Box px={2}>
  //       <Logo />
  //     </Box>
  //     {/* ------------------------------------------- */}
  //     {/* Sidebar For Mobile */}
  //     {/* ------------------------------------------- */}
  //     <SidebarItems />
  //   </Drawer>
  // );
};

export default Navigation;
