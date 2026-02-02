import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";


@Injectable()   

export class GoogleStrategy  extends PassportStrategy(Strategy) {
    constructor(){
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/user/google/callback',
            scope: ['email', 'profile']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile, done) {
        const user = {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            accessToken
        };
        done(null, user);
        
    }

}