
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey123456789',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
};

// Validate required env vars
const required = ['DATABASE_URL', 'JWT_SECRET'] as const;
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('Please check your .env file');
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Log config (excluding secrets)
console.log('✅ Config loaded:');
console.log(`   PORT: ${config.port}`);
console.log(`   NODE_ENV: ${config.nodeEnv}`);
console.log(`   FRONTEND_URL: ${config.frontendUrl}`);
console.log(`   DATABASE_URL: ${config.databaseUrl ? '✅ Present' : '❌ Missing'}`);