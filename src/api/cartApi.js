import api from "./axios";

export const createCart = async (cartData) => {
    const response = await api.post('/cart/create', cartData);
    return response.data;
  };

export const getCart = async (session_id)=>{
  const res = await api.post("/cart/cart",{session_id});  
  return res.data.cart;
}