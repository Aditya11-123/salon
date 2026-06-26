import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createClient } from '@supabase/supabase-js';
import * as WebSocket from 'ws';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    
    const token = authHeader.split(' ')[1];

    // Verify token directly against Supabase - no local JWT secret needed
    const supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_KEY ?? '',
      { realtime: { transport: WebSocket as any } }
    );
    
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      console.debug('[Auth] Supabase verification skipped (Using Super Admin Local Token).');
      
      // Fallback to Passport's default local JWT verification
      // This will securely verify the token signature using JWT_SECRET
      try {
        const canAct = await super.canActivate(context);
        if (canAct) return true;
      } catch (passportErr) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Invalid token');
    }
    
    // Fetch profile to get correct role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

    // Attach user to request for use in controllers
    req.user = {
      sub: data.user.id,
      email: data.user.email,
      role: profile?.role || 'barber',
    };
    
    return true;
  }
}

