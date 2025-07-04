import React, { useState } from "react";
import { Button } from "../ui/button";
import { IndianRupee, Loader2 } from "lucide-react";
import axios from "axios";
import Script from "next/script";
import toast from "react-hot-toast";

interface IPaymentProps {
  amount: number;
  bookingId: string;
}

const Payment = ({ amount, bookingId }: IPaymentProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  async function handlePayment() {
    if (typeof window === "undefined" || !(window as any).Razorpay) {
      toast.error("Razorpay SDK not loaded yet. Please try again in a moment.");
      return;
    }
    setLoading(true);
    console.log({ bookingId });
    try {
      const response = await axios.post("/api/razorpay/create-payment", {
        amount,
        bookingId,
      });

      const order = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Your Company",
        description: "Test Transaction",
        order_id: order.id,
        callback_url: "https://sayahak.vercel.app/api/razorpay/verify-payment",
        // callback_url: "http://localhost:3000/api/razorpay/verify-payment",
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <Button
          disabled={loading}
          onClick={handlePayment}
          className="w-full px-4 py-2 cursor-progress bg-green-500 hover:bg-green-600/100 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Loader2 className="animate-spin" /> <span>Loading</span>
        </Button>
      ) : (
        <Button
          disabled={loading}
          onClick={handlePayment}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600/100 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <IndianRupee className="h-5 w-5" />
          <span>Make a Payment</span>
        </Button>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
};

export default Payment;
