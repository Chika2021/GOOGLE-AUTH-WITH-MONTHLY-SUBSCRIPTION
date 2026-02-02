import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Model/user.model';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ANYACHIKAAMAECHI',
      signOptions: {expiresIn: '1h'}

    }),
    TypeOrmModule.forFeature([User])
  ],
  providers: [UserService, GoogleStrategy, JwtStrategy],
  controllers: [UserController],
  exports: [UserService, PassportModule, JwtModule]
})
export class UserModule {}
