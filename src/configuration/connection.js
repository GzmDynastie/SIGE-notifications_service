import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const {
  MASTER_DB_HOST,
  MASTER_DB_PORT,
  MASTER_DB_DATABASE,
  MASTER_DB_USERNAME,
  MASTER_DB_PASSWORD
} = process.env;

if (!MASTER_DB_HOST || !MASTER_DB_PORT || !MASTER_DB_DATABASE || !MASTER_DB_USERNAME || !MASTER_DB_PASSWORD) {
  console.error("Faltan variables de entorno");
}

const master = new Pool({
  user: MASTER_DB_USERNAME,
  host: MASTER_DB_HOST,
  database: MASTER_DB_DATABASE,
  password: MASTER_DB_PASSWORD,
  port: MASTER_DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  }
});

export { master };