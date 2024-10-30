import React, { useEffect } from 'react';
import { Typography, ImageList, ImageListItem, Skeleton, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPhotos } from 'src/store/apps/userProfile/UserProfileSlice';
import ChildCard from 'src/components/shared/ChildCard';

const PhotosCard = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchPhotos());
  }, [dispatch]);

  const getPhotos = useSelector((state) => state.userpostsReducer.gallery);
  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ChildCard>
      <Typography variant="h4">Photos</Typography>
      <ImageList cols={3} gap={20}>
        {getPhotos.map((photo) => (
          <Box key={photo.id}>
            {isLoading ? (
              <>
                <Skeleton
                  variant="square"
                  animation="wave"
                  width="100%"
                  height={93}
                  key={photo.id + photo.cover}
                ></Skeleton>
              </>
            ) : (
              <ImageListItem>
                <img
                  srcSet={`${photo.cover} 1x, ${photo.cover} 2x`}
                  alt={photo.img}
                  loading="lazy"
                  style={{ borderRadius: 8 }}
                />
              </ImageListItem>
            )}
          </Box>
        ))}
      </ImageList>
    </ChildCard>
  );
};

export default PhotosCard;
