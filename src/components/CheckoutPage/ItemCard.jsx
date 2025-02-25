import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

const ItemCard = ({ item, updateQuantity, removeItem }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
    <img src={item.program_image || "/no-image.jpg"} alt="Item" className="w-20 h-20 rounded-lg object-cover bg-gray-200" />
    <div className="flex-grow">
      <h3 className="font-medium text-black">{item.program_name}</h3>
      <p className="text-gray-900">£{item.donation_amount}</p>
      <div className="flex items-center mt-2 gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => updateQuantity(item.cart_id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded">
            <Minus size={16} className="text-gray-600" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.cart_id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded">
            <Plus size={16} className="text-gray-600" />
          </button>
        </div>
        <button onClick={() => removeItem(item.cart_id)} className="p-1 hover:bg-gray-200 rounded text-gray-600">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    <p className="font-medium text-black">£{(item.donation_amount * item.quantity).toFixed(2)}</p>
  </div>
);

export default ItemCard;