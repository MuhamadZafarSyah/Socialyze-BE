import mysql from "mysql2/promise";

export async function connect() {
  try {
    await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "social_media",
      port: 3306,
      password: "",
    });
    console.log("Database Connected");
  } catch (err) {
    console.log(err);
  }
}
