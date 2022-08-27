import { Pool } from "pg";
export const pool = new Pool({
  user: "postgres",
  password: "123",
  database: "ooredoo",
  host: "localhost",
  port: 5432,
});
