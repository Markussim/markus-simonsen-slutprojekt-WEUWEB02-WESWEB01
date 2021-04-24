require("dotenv").config();
const fs = require("fs");
const express = require("express");
const app = express();
const { Pool, Client } = require("pg");
const port = process.env.PORT || 3000;
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const passportInit = require("./passport-config");

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
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
  user: process.env.POSTGRESUSR,
  host: process.env.POSTGRESHOST,
  database: process.env.POSTGRESDATABASE,
  password: process.env.POSTGRESPASS,
});

passportInit(passport, async (userName, password) => {
  return await (await pool.query(login, [userName, password])).rows;
});

app.get("/getall", async (req, res) => {
  res.send(await (await pool.query(getall)).rows);
});

app.get("/placeholderlogin", checkNotAuthenticated, async (req, res) => {
  res.sendFile(client + "login.html");
});

app.get("/placeholderregister", checkNotAuthenticated, async (req, res) => {
  res.sendFile(client + "register.html");
});

app.post(
  "/loginPost",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/placeholderlogin",
    failureFlash: false,
  })
);

app.post("/registerPost", checkNotAuthenticated, async (req, res) => {
  console.log(req.body.password);
  await pool.query(createuser, [req.body.name, req.body.password]);
  res.send(req.body.password);
});

function checkNotAuthenticated(req, res, next) {
  console.log(req.user);
  if (req.isAuthenticated()) {
    return res.redirect("/getall");
  }
  next();
}

app.listen(port, () => console.log(`Server listening on port ${port}!`));
