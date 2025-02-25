import api from "./axios"

export const getReferenceId = async(id)=>{
    const response = await api.get(`/payment/reference/${id}`)
    return response;
}


export const updateTransaction = async (data)=>{
        // Create and populate FormData
        // const form_Data = new FormData();
        // form_Data.append("auth", 0);
        // form_Data.append("session_id", sessionId);
        // form_Data.append("reference_no", refId);
        // form_Data.append("guest_details", JSON.stringify(updatedFormData));
        // form_Data.append("payment_method", formData.paywith);
        // form_Data.append("claim_donation","Y" );
        // form_Data.append("tele_calling", contactPrefs.phone);
        // form_Data.append("send_email", contactPrefs.email);
        // form_Data.append("send_mail", contactPrefs.post);
        // form_Data.append("send_text", contactPrefs.sms);
        // form_Data.append("client_id", 1);
        // try {
        //   const response = await api.post(`payment/transaction`);
        //   return response.data;
        // } catch (error) {
        //   console.error("Error in creating transaction:", error.message);
        //   throw error;
        // }
}