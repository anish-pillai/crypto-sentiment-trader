import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5433', 10),
});

pool
  .connect()
  .then((client) => {
    console.log('Connected to Postgres database');
    client.release();
  })
  .catch((err) => {
    console.error('Error connecting to Postgres database:', err);
  });

export default pool;
