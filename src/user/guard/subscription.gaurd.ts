import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1️⃣ User must exist (JWT ran first)
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // 2️⃣ User must have active subscription
    if (!user.isSubscribed) {
      throw new ForbiddenException('Subscription required');
    }

    // 3️⃣ Subscription must not be expired
    if (!user.subscriptionExpiresAt) {
      throw new ForbiddenException('Subscription inactive');
    }

    const now = new Date();
    const expiry = new Date(user.subscriptionExpiresAt);

    if (expiry < now) {
      throw new ForbiddenException('Subscription expired');
    }

    return true; // ✅ Access granted
  }
}
