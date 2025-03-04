import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { X} from "lucide-react";
import stripeLogo from "./Stripe.png";

const DonationWidget = () => {
    const [amount, setAmount] = useState(5);
    const [message, setMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const presetAmounts = [5, 10, 20, 50, 100];

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        try {
            const response = await axios.post("/api/donate", {
                amount,
                paymentMethodId: paymentMethod.id,
            });

            setMessage(response.data.success
                ? "Donation successful! Thank you for your support."
                : "Donation failed. Please try again."
            );
        } catch {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Floating Donation Button */}
            <button
                className="bg-black text-red-600 border-2 border-red-600 p-3 rounded-full shadow-lg
                hover:bg-red-600 hover:text-black transition-all"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : "Donate"}
            </button>

            {isOpen && (
                <div className="bg-black text-white border-2 border-red-600 p-6 rounded-lg shadow-2xl mt-4
                    w-80 max-w-full sm:w-96">
                    <h2 className="text-xl font-bold text-red-600 text-center">Donate to the Cause</h2>

                    {/* Donation Form */}
                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white">Amount</label>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {presetAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className={`px-4 py-2 min-w-16 rounded-md text-black font-bold transition-all
                                            ${amount === amt ? "bg-red-600" : "bg-gray-900 border border-red-600 text-white hover:bg-red-600 hover:text-black"}`}
                                        onClick={() => setAmount(amt)}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="Custom Amount"
                                className="mt-3 block w-full p-2 bg-gray-900 border border-red-600 text-white rounded-md
                                focus:ring-red-600 focus:border-red-600 appearance-none"
                                style={{ MozAppearance: "textfield" }}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white">Credit or Debit Card</label>
                            <div className="p-2 bg-gray-900 border border-red-600 rounded-md">
                                <CardElement className="p-2" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!stripe}
                            className="w-full bg-red-600 text-black font-bold py-2 px-4 rounded-md hover:bg-red-800 hover:text-white transition-all"
                        >
                            Donate
                        </button>
                    </form>

                    {message && <p className="mt-3 text-center text-sm text-red-400">{message}</p>}

                    {/* Stripe Secure Payment Badge */}
                    <div className="mt-4 flex justify-center">
                        <span className="flex items-center text-sm text-gray-400">
                            Powered by
                            <img src={stripeLogo.src} width="80" alt="Powered by Stripe" className="ml-2 opacity-80" />
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonationWidget;
