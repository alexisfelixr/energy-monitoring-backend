import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterUsuarioDto } from './dto/register-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30; // 30 días para el refresh token

  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerUsuarioDto: RegisterUsuarioDto): Promise<{ accessToken: string; refreshToken: string }> {
    // Verificar si el email ya existe
    const existingUser = await this.usuariosRepository.findOne({ where: { email: registerUsuarioDto.email } });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerUsuarioDto.password, 10);

    // Crear nuevo usuario
    const newUser = this.usuariosRepository.create({
      ...registerUsuarioDto,
      password: hashedPassword,
    });

    // Guardar usuario
    const savedUser = await this.usuariosRepository.save(newUser);
    this.logger.log(`Usuario registrado: ${savedUser.email}`);

    // Generar tokens
    return this.generateTokens(savedUser);
  }

  async login(loginUsuarioDto: LoginUsuarioDto): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // Buscar usuario por email
    const user = await this.usuariosRepository.findOne({ where: { email: loginUsuarioDto.email } });
    
    // Verificar si existe el usuario y si la contraseña es correcta
    if (!user || !(await bcrypt.compare(loginUsuarioDto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.estaActivo) {
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador.');
    }

    this.logger.log(`Usuario autenticado: ${user.email}`);

    // Generar tokens
    const tokens = await this.generateTokens(user);
    
    // Preparar datos del usuario (excluyendo campos sensibles)
    const { password, ...userInfo } = user;
    
    // Retornar tokens y datos del usuario
    return {
      ...tokens,
      user: userInfo
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // Buscar el refresh token en la base de datos
    const refreshTokenEntity = await this.refreshTokensRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });

    // Verificar si el token existe
    if (!refreshTokenEntity) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    // Verificar si el token está revocado
    if (refreshTokenEntity.esRevocado) {
      throw new UnauthorizedException('Token de actualización revocado');
    }

    // Verificar si el token ha expirado
    if (new Date() > refreshTokenEntity.fechaExpiracion) {
      throw new UnauthorizedException('Token de actualización expirado');
    }

    // Verificar si el usuario está activo
    if (!refreshTokenEntity.usuario.estaActivo) {
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador.');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(refreshTokenEntity.usuario);
    
    // Preparar datos del usuario (excluyendo campos sensibles)
    const { password, ...userInfo } = refreshTokenEntity.usuario;
    
    // Retornar tokens y datos del usuario
    return {
      ...tokens,
      user: userInfo
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Buscar y revocar el refresh token
    const result = await this.refreshTokensRepository.update(
      { token: refreshToken },
      { esRevocado: true }
    );

    if (result.affected === 0) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    this.logger.log('Usuario desconectado exitosamente');
  }

  private async generateTokens(user: Usuario): Promise<{ accessToken: string; refreshToken: string }> {
    // Payload para el JWT
    const payload = {
      sub: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
    };

    // Generar tokens
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Token de acceso expira en 1 hora (o según configuración)
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    // Generar refresh token único
    const refreshToken = uuidv4();

    // Calcular fecha de expiración para el refresh token (30 días)
    const fechaExpiracion = new Date();
    fechaExpiracion.setDate(fechaExpiracion.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Guardar refresh token en la base de datos
    await this.refreshTokensRepository.save({
      token: refreshToken,
      usuarioId: user.id,
      fechaExpiracion,
      esRevocado: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: number): Promise<any> {
    const user = await this.usuariosRepository.findOne({ where: { id: userId } });
    
    if (!user || !user.estaActivo) {
      return null;
    }
    
    // Excluir la contraseña por seguridad
    const { password, ...result } = user;
    return result;
  }
}
