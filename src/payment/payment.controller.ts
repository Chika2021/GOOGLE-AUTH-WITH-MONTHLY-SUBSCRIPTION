import { Controller, Post, Get, Query, Req, UseGuards } from '@nestjs/common';

import { UserService } from '../user/user.service';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
  ) { }

  // 1️⃣ Initialize payment
  @Post('paystack/initialize')
  @UseGuards(AuthGuard('jwt'))
  initialize(@Req() req) {
    const amount = 500000; // ₦5,000 test amount

    return this.paymentService.processPayment(
      req.user.email,
      amount,
    );
  }

  // 2️⃣ Verify payment
  @Get('paystack/verify')
  @UseGuards(AuthGuard('jwt'))
  async verify(@Query('reference') reference: string, @Req() req) {
    const payment = await this.paymentService.verifyPayment(reference);

    if (payment.status !== 'success') {
      throw new Error('Payment not successful');
    }

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    return this.userService.activateSubscription(req.user.id, expiry);
  }



  @Post('subscribe/pay')
  @UseGuards(AuthGuard('jwt'))
  subscribe(@Req() req) {

    console.log('Subscription request for user:', req.user);  

    const email = req.user?.email;
    if(!email){
      throw new Error('User email not found');
    }
    const amount = 10000; // ₦10,000 subscription amount
    return this.paymentService.processPayment(email, amount);
  }


  @Get('paystack/callback')
  async paystackCallback(@Query('reference') reference: string) {
    const payment = await this.paymentService.verifyPayment(reference);

    if (payment.status !== 'success') {
      return { message: 'Payment failed' };
    }

    // ✅ SECURITY CHECK: confirm amount (₦10,000 = 1,000,000 kobo)
    // if (payment.amount !== 10000) {
    //   throw new Error('Invalid payment amount');
    // }

    // ✅ Set expiry (1 month)
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    // ✅ Activate subscription using Paystack email
    await this.userService.activateSubscriptionByEmail(
      payment.customer.email,
      expiry,
    );

    return {
      message: 'Subscription activated 🎉',
      expiresAt: expiry,
    };
  }




  // if (payment.status !== 'success') {
  //   throw new Error('Payment not successful');
  // }

  // return this.userService.activateSubscription(req.user.id);


}