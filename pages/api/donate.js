// pages/api/donate.js
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import {getSecret} from "../../firebase/adminConfig"
import {isDev} from "../../firebase/config"





export default async function handler(req = NextApiRequest, res = NextApiResponse) {
    if (req.method === 'POST') {
        let secret;
        try {
            // Fetch the service account from Secret Manager
            if(isDev){
                secret = await getSecret('STRIPE_SECRET_KEY');
            }else{
                secret = await getSecret('STRIPE_SECRET_KEY', "1");
            }

        } catch (error) {
            console.error('Failed to fetch secret:', error);
            return res.status(500).json({ message: `Server error: ${error.message}` });
        }

        const stripe = new Stripe(secret, {
            apiVersion: '2022-11-15',
        });

        const { amount, paymentMethodId } = req.body;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // amount in cents
                currency: 'usd',
                payment_method: paymentMethodId,
                confirm: true,
            });

            if(paymentIntent.status === "succeeded"){
                res.status(200).json({ success: true });
            }else{
                res.status(400).json({ success: false, error: "Payment Status: "+paymentIntent.status });
            }


        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}