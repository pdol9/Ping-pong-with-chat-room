import Config from './interfaces/config.interface';

const config = (): Config => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  ws_port: parseInt(process.env.WS_PORT, 10) || 3000,
  postgres: {
    database: {
      name: process.env.POSTGRES_DB || 'nestjs',
      host: process.env.POSTGRES_HOST || 'postgres',
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      user: process.env.POSTGRES_USER || 'transcendence',
      password: process.env.POSTGRES_PASSWORD,
    },
  },
  api42: {
    client_id: process.env.API42_ID,
    client_secret: process.env.API42_SECRET,
    redirect_url: process.env.API42_REDIRECT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  mfa: {
    app_name: process.env.MFA_APP_NAME,
  },
});

export { config };
