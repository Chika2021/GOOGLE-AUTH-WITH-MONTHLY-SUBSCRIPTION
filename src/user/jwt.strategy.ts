import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "./user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";


@Injectable()


export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly userService: UserService) {

    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: 'ANYACHIKAAMAECHI'
    });

   }

   async validate(payload:any) {
    const user = await this.userService.findById(payload.sub)
    if(!user) {
        throw new UnauthorizedException('Invalid Login')
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isSubscribed: user.isSubscribed,
        subscriptionExpiresAt: user.subscriptionExpiresAt
    }
   }


}