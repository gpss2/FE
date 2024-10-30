import React from 'react';
import { Box, Typography, Avatar, Stack, ButtonGroup, Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { IconMinus, IconPlus } from '@tabler/icons';
import { useSelector, useDispatch } from 'react-redux';
import emptyCart from 'src/assets/images/products/empty-shopping-cart.svg';
import { increment, decrement } from 'src/store/apps/eCommerce/EcommerceSlice';

const CartItems = () => {
  const dispatch = useDispatch();

  // Get Products
  const Cartproduct = useSelector((state) => state.ecommerceReducer.cart);

  const Increase = (productId) => {
    dispatch(increment(productId));
  };

  const Decrease = (productId) => {
    dispatch(decrement(productId));
  };

  return (
    <Box px={3}>
      {Cartproduct.length > 0 ? (
        <>
          {Cartproduct.map((product, index) => (
            <Box key={product.id + index * index}>
              <Stack direction="row" spacing={2} py={3}>
                <Avatar
                  src={product.photo}
                  alt={product.photo}
                  sx={{
                    borderRadius: '10px',
                    height: '75px',
                    width: '95px',
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" color="textPrimary" fontWeight="500">
                    {product.title}
                  </Typography>{' '}
                  <Typography color="textSecondary" variant="body1">
                    {' '}
                    {product.category}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} mt="5px">
                    <Typography variant="subtitle2" color="textSecondary">
                      ${product.price * product.qty}
                    </Typography>
                    <ButtonGroup size="small" color="success" aria-label="small button group">
                      <Button onClick={() => Decrease(product.id)} disabled={product.qty < 2}>
                        <IconMinus stroke={1.5} size="0.8rem" />
                      </Button>
                      <Button>{product.qty}</Button>
                      <Button onClick={() => Increase(product.id)}>
                        <IconPlus stroke={1.5} size="0.8rem" />
                      </Button>
                    </ButtonGroup>
                  </Stack>
                </Box>
              </Stack>
              <Divider />
            </Box>
          ))}
        </>
      ) : (
        <Box textAlign="center" mb={3}>
          <img src={emptyCart} alt="cart" width="200px" />
          <Typography variant="h5" mb={2}>
            Cart is Empty
          </Typography>
          <Button component={Link} to="/apps/ecommerce/shop" variant="contained">
            Go back to Shopping
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CartItems;
