import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { MembershipsService } from '../memberships/memberships.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.fullName);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.authService.login(dto.email, dto.password, req.ip);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(dto.email);
    // Réponse identique que l'email existe ou non — évite l'énumération de comptes
    return { message: 'Si ce compte existe, un email de réinitialisation a été envoyé.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  // Déconnexion : avec des JWT stateless, la déconnexion est gérée côté
  // client (suppression du token). Le endpoint existe pour journaliser
  // l'action et pourra invalider une session serveur si on ajoute des
  // refresh tokens stockés en base plus tard.
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return { message: 'Déconnecté.' };
  }

  // Utilisateur courant + liste de ses entreprises actives (pour le
  // sélecteur d'entreprise côté frontend)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() currentUser: { userId: string; isSuperAdmin: boolean }) {
    const user = await this.usersService.findById(currentUser.userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    const memberships = await this.membershipsService.findActiveForUser(currentUser.userId);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      photoUrl: user.photoUrl,
      isSuperAdmin: user.isSuperAdmin,
      companies: memberships.map((m) => ({
        companyId: m.company.id,
        companyName: m.company.name,
        role: m.role.name,
      })),
    };
  }
}
