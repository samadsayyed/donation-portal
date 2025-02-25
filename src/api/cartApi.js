import api from "./axios";

export const createCart = async (cartData) => {
  const response = await api.post("/cart/create", cartData);
  return response.data;
};

export const getCart = async (session_id) => {

  const res = await api.post("/cart/cart", { session_id });
  return res.data.cart;
};

export const updateCart = async (data) => {

  const res = await api.post("/cart/quantity", {
    cart_id: data.id,
    quantity: data.newQuantity,
  });
  return res.data;
};

export const deleteFromCart = async (data) => {
  const res = await api.post("/cart/delete", { cart_id: data });
  return res.data;
};
