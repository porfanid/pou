// src/StripeProvider.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const isDev = process.env.NODE_ENV !== 'production';

let stripePromise;

if (isDev) {
    stripePromise = loadStripe('pk_test_51Pc88aA9B4ULHJJFAerOoJknPhT5BIBY47W6OTuVO2cqgXEa4VGf5QXRiZZTHZYsgW5oNiSfxiPEwNi6C8AT4UlA00wsjQXYYH');
} else {
    stripePromise = loadStripe('pk_live_51Pc88aA9B4ULHJJFfi9btagjpHdA5lahpXET8rE9RhSwCuG3CNhniHMSoRuwi2FEuWXxyOW0DCp9EEFmQHlex92L00UI4LC8Rx');
}



const StripeProvider = ({ children }) => {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
};

export default StripeProvider;