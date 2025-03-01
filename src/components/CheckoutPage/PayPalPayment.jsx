import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createSingleDonation } from "../../api/donationApi";
import useSessionId from "../../hooks/useSessionId";
import { useNavigate } from "react-router-dom";
import { encryptData } from "../../utils/functions";

const PayPalPayment = ({ reference_no, onSuccess }) => {
  const session = useSessionId();
  const navigate = useNavigate();




  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const totalAmount = cartItems.reduce((total, item) => total + item.donation_amount * item.quantity,0).toFixed(2);

  const createDonation = useMutation({
    mutationFn: createSingleDonation,
    onMutate: () => {
      toast.loading("Processing donation...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Donation successful!");
      const userData = localStorage.getItem("userData");
      if (userData) {
        const encryptedData = encryptData(userData);
        navigate(`/success/${encodeURIComponent(encryptedData)}`);
      }
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating donation:", error);
      toast.dismiss();
      toast.error(error.message);
    },
    onSettled: () => {
      toast.dismiss();
    },
  });

  return (
    // stage 
    // <PayPalScriptProvider options={{ "client-id": "Adm3RyFPf-3U4qNUuTD8d1G2grwiwfCfDkh04R2AKjC_yjYbbvWtiBSKnR-P2tAAGS510XkopYKa-E3p",currency:"GBP" }}>
    
    // live zobia 
    /* <PayPalScriptProvider options={{ "client-id": "Ad1m3eq6LrnYS4tb_V91bw753AMRV_-8CrioEHXvlS34vD5LrpG06w13ucpA_Tcw1FNBD7GxdFjOPZym",currency:"GBP" }}> */
    
    
    // sandbox zobia 
    <PayPalScriptProvider options={{ "client-id": "AQhpaF4siwgu44bvNCEKuROnWnhFLjIEfogaBFEl2FFdECmWPebZsgVxEBImGi8R2Ed26P7jAy2UgBeI",currency:"GBP" }}>
      <div className="mt-4">
        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: totalAmount,
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              toast.success("Payment successful!",details);

              const donationData = {
                txn_id: details.id,
                payment_amt: details.purchase_units[0].amount.value,
                currency: details.purchase_units[0].amount.currency_code,
                payment_status: "Completed",
                payment_mode_code: "PAYPAL",
                auth_code: "",
                reference_no,
                auth: 0,
                session_id: session,
              };

              createDonation.mutate(donationData);
            });
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            toast.error("Payment failed!");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
