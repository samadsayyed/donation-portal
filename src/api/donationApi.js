import axios from "axios";
import api from "./axios";

export const getReferenceId = async (id) => {
  const response = await api.get(`/payment/reference/${id}`);
  return response;
};

// Function to create payment intent
export const createPaymentIntent = async (data) => {


  const { amount, reference_no } = data;
  try {
    const response = await api.post(
      `payment/stripe/paymentIntent`,
      data
    );

    if (response.status !== 200) {
      throw new Error("Failed to create payment intent.");
    }


    return response.data;
  } catch (error) {
    console.log("error", error);

    throw new Error(
      error.message || "An error occurred while creating the payment intent."
    );
  }
};

// Function to create a donation record
export const createDonation = async (paymentIntent, reference_no) => {
  const donationData = {
    txn_id: paymentIntent.id,
    payment_amt: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    payment_status: "Completed",
    payment_mode_code: "STRIPE",
    reference_no: reference_no,
    session_id: JSON.parse(localStorage.getItem("sessionIdData"))?.sessionId,
  };

  try {
    const response = await api.post(
      `payment/create-single-donation`,
      donationData,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Failed to create donation record.");
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error.message || "An error occurred while creating the donation."
    );
  }
};


  export const createSingleDonation = async (data) => {
    

    const response = await api.post(`payment/create-single-donation`,data);

    return response.data;
  }