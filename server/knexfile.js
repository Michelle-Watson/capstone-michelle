import "dotenv/config";

const { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } = process.env;

export default {
  client: "mysql2",
  connection: {
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    charset: "utf8",
  },
};
