require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const { Pool, Client } = require("pg");
const port = process.env.PORT || 3000;
const getall = fs.readFileSync("./sql/getall.sql", {
  encoding: "utf8",
  flag: "r",
});
const createuser = fs.readFileSync("./sql/createUser.sql", {
  encoding: "utf8",
  flag: "r",
});
const login = fs.readFileSync("./sql/login.sql", {
  encoding: "utf8",
  flag: "r",
});
const client = __dirname + "/client/";
app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.POSTGRESUSR,
  host: process.env.POSTGRESHOST,
  database: process.env.POSTGRESDATABASE,
  password: process.env.POSTGRESPASS,
});

app.get("/getall", async (req, res) => {
  res.send(await (await pool.query(getall)).rows);
});

app.get("/placeholderlogin", async (req, res) => {
  res.sendFile(client + "login.html");
});

app.get("/placeholderregister", async (req, res) => {
  res.sendFile(client + "register.html");
});

app.post("/loginPost", async (req, res) => {
  let answer = await (await pool.query(login, [req.body.name, req.body.password])).rows;
  console.log(answer);
  res.send(answer);
});

app.post("/registerPost", async (req, res) => {
  console.log(req.body.password);
  await pool.query(createuser, [req.body.name, req.body.password]);
  res.send(req.body.password);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
