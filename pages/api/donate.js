// pages/api/donate.js
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import {isDev} from "../../firebase/config"

const stripe = new Stripe(isDev?process.env.STRIPE_SECRET_KEY_TEST:process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
});

export default async function handler(req = NextApiRequest, res = NextApiResponse) {
    if (req.method === 'POST') {
        const { amount, paymentMethodId } = req.body;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // amount in cents
                currency: 'usd',
                payment_method: paymentMethodId,
                confirm: true,
            });

            res.status(200).json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}