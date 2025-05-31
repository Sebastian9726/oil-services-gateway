import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response.output';
import { LoginResponse } from './dto/login-response.output';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async loginWithContext(
    @Args('loginInput') loginInput: LoginInput,
    @Context() context: any,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(loginInput);
    
    // Opcional: Configurar cookie para el token
    if (context.res) {
      const maxAge = 24 * 60 * 60 * 1000; // 1 día en milisegundos
      context.res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge,
      });
    }
    
    return result;
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: any): Promise<boolean> {
    // Limpiar cookie si existe
    if (context.res) {
      context.res.clearCookie('access_token');
    }
    
    return true;
  }
} 