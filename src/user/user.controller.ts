import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { User } from './Model/user.model';
import { UserService } from './user.service';
import { RegisterDto } from './Model/dto/register.dto';
import { LoginDto } from './Model/dto/login.dto';
import { register } from 'module';
import { AuthGuard } from '@nestjs/passport';
import { Repository } from 'typeorm';


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @Post('register')
    async register(@Body() registerUser: RegisterDto): Promise<{user: User, token: string}> {
        return this.userService.register(registerUser);
    }

    @Post('login')
    async login(@Body()  loginDto: LoginDto) {
        return this.userService.login(loginDto);
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleLogin( @Req() req) { 
        console.log(req.user);
        return {
            message: 'Google login successful',
            user: req.user};
    }

    @Post('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback( @Body() req) {
        return this.userService.googleLogin(req.user)

    }

    // @Post('subscribe')

    // async subscribe(@Req() req){
    //     //IMPLEMENT SUBSCRIPTION LOGIC HERE
    //     const expiry = new Date();
    //     expiry.setMonth(expiry.getMonth() + 1); //1 MONTH SUBSCRIPTION

    //     await this.userRepository.update(req.user.id, {
    //         isSubscribed: true,
    //         subscriptionExpiresAt: expiry
    //     });

    //     return {message: 'Subscription successful', subscriptionExpiresAt: expiry};
    // }

    @UseGuards(AuthGuard('jwt'))
    @Post('subscribe')

    subscribe(@Req() req) {
        return this.userService.subscribe(req.user.id);
    }


}