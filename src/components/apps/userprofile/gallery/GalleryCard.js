import {
  Box,
  Stack,
  Grid,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  CardMedia,
  Skeleton,
} from '@mui/material';
import React, { useEffect } from 'react';
import BlankCard from 'src/components/shared/BlankCard';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPhotos } from 'src/store/apps/userProfile/UserProfileSlice';
import { IconDotsVertical, IconSearch } from '@tabler/icons';
import { format } from 'date-fns';

const GalleryCard = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPhotos());
  }, [dispatch]);

  const filterPhotos = (photos, cSearch) => {
    if (photos)
      return photos.filter((t) => t.name.toLocaleLowerCase().includes(cSearch.toLocaleLowerCase()));

    return photos;
  };
  const [search, setSearch] = React.useState('');
  const getPhotos = useSelector((state) => filterPhotos(state.userpostsReducer.gallery, search));

  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item sm={12} lg={12}>
          <Stack direction="row" alignItems={'center'} mt={2}>
            <Box>
              <Typography variant="h3">
                Gallery &nbsp;
                <Chip label={getPhotos.length} color="secondary" size="small" />
              </Typography>
            </Box>
            <Box ml="auto">
              <TextField
                id="outlined-search"
                placeholder="Search Gallery"
                size="small"
                type="search"
                variant="outlined"
                inputProps={{ 'aria-label': 'Search Gallery' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size="14" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
          </Stack>
        </Grid>
        {getPhotos.map((photo) => {
          return (
            <Grid item xs={12} lg={4} key={photo.id}>
              <BlankCard className="hoverCard">
                {isLoading ? (
                  <>
                    <Skeleton
                      variant="square"
                      animation="wave"
                      width="100%"
                      height={220}
                    ></Skeleton>
                  </>
                ) : (
                  <CardMedia component={'img'} height="220" alt="Remy Sharp" src={photo.cover} />
                )}
                <Box p={3}>
                  <Stack direction="row" gap={1}>
                    <Box>
                      <Typography variant="h6">{photo.name}jpg</Typography>
                      <Typography variant="caption">
                        {format(new Date(photo.time), 'E, MMM d, yyyy')}
                      </Typography>
                    </Box>
                    <Box ml={'auto'}>
                      <IconButton>
                        <IconDotsVertical size="16" />
                      </IconButton>
                    </Box>
                  </Stack>
                </Box>
              </BlankCard>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default GalleryCard;
