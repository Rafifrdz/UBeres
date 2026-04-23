import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  apiPort: Number(process.env.API_PORT ?? 8080),
  mongodbUri: required('MONGODB_URI'),
  mongodbDbName: required('MONGODB_DB_NAME', 'uberes'),
  googleClientId: required('GOOGLE_CLIENT_ID'),
};
