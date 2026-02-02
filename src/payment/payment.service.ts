import { Injectable, InternalServerErrorException } from "@nestjs/common";
import axios from "axios";
import { callbackify } from "util";


@Injectable()

export class PaymentService {
    // Paystack service methods will go here
    async processPayment(email: string, amount: number) {
        // Logic to process payment via Paystack
        try {
            // Simulate payment processing
            const response = await axios.post('https://api.paystack.co/transaction/initialize', {
                email,
                amount: amount * 100,
                callback_url: process.env.PAYSTACK_CALLBACK_URL
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            });
            return {
                authorization_url: response.data.data.authorization_url,
                access_code: response.data.data.access_code,
                reference: response.data.data.reference
            }


        } catch (error) {
            console.error('Paystack error:', error.response?.data || error.message);
            throw new InternalServerErrorException('Payment processing failed');
        }

    }

    async verifyPayment(reference: string) {
        // Logic to verify payment via Paystack
        try {
            const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            });
            return response.data.data;
        }
        catch (error) {
            console.error('Paystack error:', error.response?.data || error.message);
            throw new InternalServerErrorException('Payment verification failed');
        }

    }




}