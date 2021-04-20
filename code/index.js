require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const { Pool, Client } = require("pg");
const port = process.env.PORT || 3000;
const getall = fs.readFileSync("./sql/getall.sql", { encoding: "utf8", flag: "r" });

const pool = new Pool({
  user: process.env.POSTGRESUSR,
  host: process.env.POSTGRESHOST,
  database: process.env.POSTGRESDATABASE,
  password: process.env.POSTGRESPASS,
});

app.get("/", async (req, res) => {
    res.send(await (await pool.query(getall)).rows)
});
app.listen(port, () => console.log(`Server listening on port ${port}!`));
