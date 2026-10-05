// Shared Supabase PostgreSQL Pool
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xwdxicmraostvuyzyesp:harshgoyal6468@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

let pool;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 2,
            idleTimeoutMillis: 5000,
            connectionTimeoutMillis: 5000,
        });
    }
    return pool;
}

module.exports = { getPool };
