const LocalStrategy = require("passport-local").Strategy;
const fs = require("fs");
const login = fs.readFileSync("./sql/login.sql", {
  encoding: "utf8",
  flag: "r",
});

function initialize(passport, checkUser) {
  const authenticateUser = async (userName, password, done) => {
    const logininFailMessage = "Incorrect username or password";
    let users = await checkUser(userName, password);
    let user = users[0];
    if (user == null) {
      return done(null, false, { message: logininFailMessage });
    }
    try {
      if (password == user.pass) {
        return done(null, user);
      } else {
        return done(null, false, { message: logininFailMessage });
      }
    } catch (e) {
      console.log("Broke")
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "name", passwordField: "password" },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user.username));
  passport.deserializeUser(async (userName, done) => {
    return done(null, await checkUser(userName, passport));
  });
}

module.exports = initialize;
