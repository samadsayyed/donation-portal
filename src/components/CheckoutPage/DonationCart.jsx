import React from "react";
import ItemCard from "./ItemCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteFromCart, getCart, updateCart } from "../../api/cartApi";
import useSessionId from "../../hooks/useSessionId";
import toast from "react-hot-toast";

const DonationCart = ({ setDonation }) => {

  const sessionId = useSessionId();

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (sessionId ? await getCart(sessionId) : []),
    enabled: !!sessionId,
    refetchInterval: 300000,
  });
  const quantityMutation = useMutation({
    mutationFn: updateCart,
    onMutate: () => {
      toast.loading("Updating cart...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Cart updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error updating cart: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFromCart,
    onMutate: () => {
      toast.loading("Removing item...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Item removed from cart");
      refetch();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error removing item: ${error.message}`);
    },
  });

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    quantityMutation.mutate({ id, newQuantity });
  };

  const removeItem = (cartId) => {
    deleteMutation.mutate(cartId);
  };

  const getTotalAmount = () =>
    data.reduce((sum, item) => sum + item.donation_amount * item.quantity, 0);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-black">Your Donation Cart</h2>
      {data.map((item) => {

        return (
          <ItemCard key={item.id} item={item} updateQuantity={updateQuantity} removeItem={removeItem} showParticipantInput={true} />
        )
      })}
      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <p className="font-medium text-black">Total Amount:</p>
        <p className="text-xl font-semibold text-black">£{getTotalAmount().toFixed(2)}</p>
      </div>
    </div>
  );
};

export default DonationCart;
