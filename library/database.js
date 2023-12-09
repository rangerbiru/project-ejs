const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "sekolah_rabbaanii",
});

connection.connect(function (err) {
  if (!!err) {
    console.log(err);
  } else {
    console.log("Berhasil Connect");
  }
});

module.exports = connection;
