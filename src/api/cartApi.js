import { data } from "autoprefixer";
import api from "./axios";
import axios from "axios";

export const createCart = async (cartData) => {
  const response = await api.post("/cart/create", cartData, {
    timeout: 30000,
  });
  return response.data;
};

export const getCart = async (data) => {
  const res = await api.post("/cart/cart", data);
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

export const updateParticipant = async (data) => {
  const res = await api.post("/cart/update-participant", {
    cart_id: data.cart_id,
    participant_name: data.participant_name
  });
  return res.data;
};

export const cartTransaction = async (data) => {


  const guest_details = {
    title: data.personalInfo.title,
    first_name: data.personalInfo.firstName,
    last_name: data.personalInfo.lastName,
    phone: data.personalInfo.phone,
    email: data.personalInfo.email,
    address1: data.personalInfo.address1,
    address2: data.personalInfo.address2,
    postcode: data.personalInfo.postcode,
    city: data.personalInfo.city,
    city_id: "1",
    country: data.personalInfo.country,
    city_name: data.personalInfo.city,
  };

  const form_Data = new FormData();

  if(data.isAuthenticated){
    form_Data.append("auth", 1);
    form_Data.append("donor_id", data.user.user_id);
    form_Data.append("donor_address_id", data.personalInfo.address_id);
  }else{
    form_Data.append("auth", 0);
    form_Data.append("session_id", data.session);
    // form_Data.append("reference_no", data.referenceId);
    form_Data.append("guest_details", JSON.stringify(guest_details));
  }
  form_Data.append("reference_no", data.referenceId);
  form_Data.append("payment_method", "");
  form_Data.append("is_giftaid", data.giftAid ? "Y" : "N");
  form_Data.append("tele_calling", data.phone ? "Y" : "N");
  form_Data.append("send_email", data.email ? "Y" : "N");
  form_Data.append("send_mail", data.post ? "Y" : "N");
  form_Data.append("send_text", data.sms ? "Y" : "N");
  form_Data.append("client_id", 1);
  
  try {
    // const response = await api.post(`payment/transaction`, form_Data);

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}payment/transaction`,
      form_Data,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in creating transaction:", error.message);
    throw error;
  }
};
