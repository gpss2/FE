import React from 'react';
import { Grid } from '@mui/material';
import ParentCard from '../../../components/shared/ParentCard';
import ChildCard from '../../../components/shared/ChildCard';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../components/container/PageContainer';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Date Time',
  },
];

const ExDateTime = () => {
  const [value, setValue] = React.useState(new Date());
  const [value2, setValue2] = React.useState(new Date());

  return (
    <PageContainer title="Date Time" description="this is Date Time page">
      {/* breadcrumb */}
      <Breadcrumb title="Date Picker" items={BCrumb} />
      {/* end breadcrumb */}

      <ParentCard title="Date Time">
        <Grid container spacing={3}>
          {/* ------------------------------------------------------------------- */}
          {/* Basic */}
          {/* ------------------------------------------------------------------- */}
          <Grid item xs={12} lg={6} sm={6} display="flex" alignItems="stretch">
            <ChildCard title="Basic">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MobileDateTimePicker
                  placeholder="Start date"
                  onChange={() => { }}
                  renderInput={(inputProps) => (
                    <CustomTextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      inputProps={{ 'aria-label': 'basic date picker' }}
                      {...inputProps}
                    />
                  )}
                  value={new Date()}
                />
              </LocalizationProvider>
            </ChildCard>
          </Grid>
          {/* ------------------------------------------------------------------- */}
          {/* Different */}
          {/* ------------------------------------------------------------------- */}
          <Grid item xs={12} lg={6} sm={6} display="flex" alignItems="stretch">
            <ChildCard title="Different Design">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  renderInput={(props) => <CustomTextField {...props} fullWidth size="small" sx={{
                    '& .MuiSvgIcon-root': {
                      width: '18px',
                      height: '18px',
                    },
                    '& .MuiFormHelperText-root': {
                      display: 'none',
                    },
                  }} />}
                  placeholder="DateTimePicker"
                  value={value}
                  onChange={(newValue) => {
                    setValue(newValue);
                  }}
                />
              </LocalizationProvider>
            </ChildCard>
          </Grid>
          {/* ------------------------------------------------------------------- */}
          {/* Timepicker */}
          {/* ------------------------------------------------------------------- */}
          <Grid item xs={12} lg={6} sm={6} display="flex" alignItems="stretch">
            <ChildCard title="Timepicker">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  value={value2}
                  onChange={(newValue) => {
                    setValue2(newValue);
                  }}
                  renderInput={(params) => (
                    <CustomTextField
                      size="small"
                      {...params}
                      fullWidth
                      sx={{
                        '& .MuiSvgIcon-root': {
                          width: '18px',
                          height: '18px',
                        },
                        '& .MuiFormHelperText-root': {
                          display: 'none',
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </ChildCard>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default ExDateTime;
