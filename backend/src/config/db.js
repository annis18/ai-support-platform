import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Import directly from where Prisma 7 actually generates the client
// The @prisma/client stub doesn't work correctly with driver adapters in v7
import { PrismaClient } from '../../node_modules/.prisma/client/index.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

// Verify connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Connection failed:', err);
  } else {
    console.log('[DB] PostgreSQL connected successfully');
    release();
  }
});

export default prisma;