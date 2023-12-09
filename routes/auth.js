var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local");
// var crypto = require("crypto");

var connection = require("../library/database");

passport.use(
  new LocalStrategy(function verify(username, cb) {
    connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      function (err, user) {
        if (err) {
          return cb(err);
        }
        if (!user) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        // crypto.pbkdf2(
        //   password,
        //   user.salt,
        //   310000,
        //   32,
        //   "sha256",
        //   function (err, hashedPassword) {
        //     if (err) {
        //       return cb(err);
        //     }
        //     if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
        //       return cb(null, false, {
        //         message: "Incorrect username or password.",
        //       });
        //     }
        //     return cb(null, user);
        //   }
        // );
      }
    );
  })
);

router.get("/login", function (req, res, next) {
  res.render("authSiswa/login");
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = router;
