import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './Model/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './Model/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './Model/dto/login.dto';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserService {

    constructor(@InjectRepository(User)
    private userRepository: Repository<User>,
        private jwtService: JwtService) { }


    async register(registerUser: RegisterDto): Promise<{ user: User, token: string }> {
        const { name, age, email, password } = registerUser;
        const hashedPassword = await bcrypt.hash(password, 10);



        const user = this.userRepository.create({
            name,
            age,
            email,
            password: hashedPassword,
            isSubscribed: false,
            subscriptionExpiresAt: undefined
        });

        await this.userRepository.save(user);

        const token = this.jwtService.sign({
            id: user.id,
            name: user.name,
            isSubscribed: user.isSubscribed,
            subscriptionExpiresAt: user.subscriptionExpiresAt
        });

        return { user, token };
    }




    async login(userLogin: LoginDto) {
        const { email, password } = userLogin;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid Email or Password');

        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid Email or Password');
        }

        const token = this.jwtService.sign({
            id: user.id,
            name: user.name,
            isSubscribed: user.isSubscribed,
            subscriptionExpiresAt: user.subscriptionExpiresAt
        })

        return { user, token };
    }

    async googleLogin(googleUser: any): Promise<{ user: User, token: string }> {
        let user = await this.userRepository.findOne({ where: { googleId: googleUser.googleId } });
        if (!user) {
            user = this.userRepository.create({
                name: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.googleId,
                isSubscribed: false,
            });
            await this.userRepository.save(user);
        }
        const token = this.jwtService.sign({
            id: user.id,
            name: user.name,
            isSubscribed: user.isSubscribed,
            subscriptionExpiresAt: user.subscriptionExpiresAt
        });
        return { user, token };
    }


    async subscribe(userId: number) {
        // 1️⃣ Get user
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        // 2️⃣ Check if already subscribed and still active
        if (
            user.isSubscribed &&
            user.subscriptionExpiresAt &&
            user.subscriptionExpiresAt > new Date()
        ) {
            return {
                message: 'Subscription already active',
                subscriptionExpiresAt: user.subscriptionExpiresAt,
            };
        }

        // 3️⃣ Set expiry to 1 month
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);

        // 4️⃣ Update user subscription
        await this.userRepository.update(userId, {
            isSubscribed: true,
            subscriptionExpiresAt: expiry,
        });

        return {
            message: 'Subscription successful',
            subscriptionExpiresAt: expiry,
        }
    }


    async findById(id: number): Promise<User | null> {
        const user = this.userRepository.findOne({ where: { id } })
        if (!user) {
            throw new UnauthorizedException('User not found')
        }
        return user;
    }

    async activateSubscription(userId: number, expiryDate: Date) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        await this.userRepository.update(userId, {
            isSubscribed: true,
            subscriptionExpiresAt: expiryDate,
        });

        return {
            message: 'Subscription activated successfully',
            subscriptionExpiresAt: expiryDate,
        };
    }


  async activateSubscriptionByEmail(email: string, expiry: Date) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // ✅ Optional: prevent double active subscription
    if (
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt > new Date()
    ) {
      return {
        message: 'Subscription already active',
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      };
    }

    await this.userRepository.update(
      { email },
      {
        isSubscribed: true,
        subscriptionExpiresAt: expiry,
      },
    );

    return {
      message: 'Subscription activated successfully 🎉',
      subscriptionExpiresAt: expiry,
    };
  }

}
