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
var SessionStore = require("./libs/session-sql")(session);

app.set("view engine", "ejs");

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

const getUser = fs.readFileSync("./sql/getUser.sql", {
  encoding: "utf8",
  flag: "r",
});

const post = fs.readFileSync("./sql/post.sql", {
  encoding: "utf8",
  flag: "r",
});
const client = __dirname + "/client/";

const databaseLogin = {
  user: process.env.POSTGRESUSR,
  host: process.env.POSTGRESHOST,
  database: process.env.POSTGRESDATABASE,
  password: process.env.POSTGRESPASS,
};

const pool = new Pool(databaseLogin);

var options = {
  client: "pg",
  connection: databaseLogin,
  table: "sessions",
  expires: 365 * 24 * 60 * 60 * 1000, // 1 year in ms
};

var sessionStore = new SessionStore(options);

app.use(express.static("static"));
app.use(express.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passportInit(
  passport,
  async (userName, password) => {
    let out = await (await pool.query(login, [userName, password])).rows;
    return out[0];
  },
  async (userName) => {
    let out = await (await pool.query(getUser, [userName])).rows;
    return out[0];
  }
);

app.get("/", checkAuthenticated, async (req, res) => {
  console.log(req.user.name);
  res.render(client + "home.ejs", {
    userName: req.user.username,
    loggedIn: req.user,
  });
});

app.get("/post", checkAuthenticated, async (req, res) => {
  res.sendFile(client + "post.html");
});

app.get("/getall", async (req, res) => {
  res.send(await (await pool.query(getall)).rows);
});

app.get("/placeholderlogin", checkNotAuthenticated, async (req, res) => {
  res.render(client + "login.ejs", {
    loggedIn: req.user,
  });
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
    failureFlash: true,
  })
);

app.post("/registerPost", checkNotAuthenticated, async (req, res) => {
  console.log(req.body.password);
  try {
    await pool.query(createuser, [req.body.name, req.body.password]);
  } catch (error) {
    res.status(500);
  }

  res.send("Succsess");
});

app.post("/postPost", checkAuthenticated, async (req, res) => {
  try {
    console.log(req.body.desc);
    await pool.query(post, [req.body.title, req.body.desc, req.user.id]);
    res.redirect("/");
  } catch (error) {
    res.status(500);
  }
});

function checkNotAuthenticated(req, res, next) {
  //console.log(req.user);
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function checkAuthenticated(req, res, next) {
  //console.log(req.user);
  if (!req.isAuthenticated()) {
    return res.redirect("/placeholderlogin");
  }
  next();
}

if (process.argv[2] != "test")
  app.listen(port, () => console.log(`Server listening on port ${port}!`));
