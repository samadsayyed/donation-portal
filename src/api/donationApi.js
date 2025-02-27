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
    const response = await axios.post(
      `https://icharms.mysadaqahonline.com/api/v1/payment/stripe/paymentIntent`,
      {
        amount: amount * 100, // Convert to cents
        reference_id: reference_no,
      },
      {
        headers: {
          Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5ZDVlNGU2Ny02MGFlLTQwZjgtOGUxOS04Y2FjNTAwYzZhMjciLCJqdGkiOiI3ZmViODc5YjUzMGE2ZWJhYmRhOTg4MjQxMTU0NTkyOWMzNzg4MzQ4MzNjNmJlZjg5YTg5ZmE4ZmZkNWM5YTJmMDU4Y2MwZjE4ZjdhM2Q1YSIsImlhdCI6MTczMjk3NDk3Ni4xNzc3NjgsIm5iZiI6MTczMjk3NDk3Ni4xNzc3NzEsImV4cCI6MTc2NDUxMDk3Ni4xNzIwMTcsInN1YiI6IjIiLCJzY29wZXMiOltdfQ.B8MWJl8fDLGzp9KWD2eJ1zUhGatHTQ8enjriODZSD8qS3cnFZIU7xgbDceBC4pJ8THfHtUjz_0GWl85RssUtbJh1V4tzQnsoT8WjTQr5V-VgUTj2GMDAHOiTE9PFE8wKW4SYzXXZiEbl_BnA5aeVcZS9spUzl_UEQ9lZUvCWAfGm94b2UIC6Xo3W8udCcw-dZYCNTwvvmHPtCdBpgtly5VAzVTj1xcElZZyybuc7hsBkLfWDOxHCHOj7kpwcf6QSeAs65BrSIFttZMyVB7weiuviIiwtaNXG1VQ4O3SswvmfvZAEXgMHxQxjM1xfoYoWzg3mNdgInPgaqdMKFjSFWpu7oAlcZfq6plpYGUvG5_i9xOVNAKYMl4QN7aJ8Dm-O26jlgXzVPIUFP7b1NZM9is9CGZSifCCVsr15SvWqPga5MLnNQ1OsBxts1hrNacuaYtro2HDZkBBimxUxyMHHppGYd4ETm5qn3LJrAIEG-0RcrEvFMF5toWH8rMQVej6thSJAM6lPjmgLVrqxZiFwKhGzUwlWgGiYwefl-TEP5XuZTQmTY2iGGL1-FTKaxis5winKQR12IQ_7SEX5ookeKid9iqSYlUE1MIz7tH7jiJc-h1U-KDcJFocKVdu_OuSIG-YISQsUVKomBWGVKoYQ4vMalo8UoW-PJdYhVjp3TgU`,
          "Content-Type": "application/json",
        },
      }
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