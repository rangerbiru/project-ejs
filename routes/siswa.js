const express = require("express");
const router = express.Router();
const fs = require("fs");

// Add Image ExpressJs
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/images");
  },

  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Import Database
var connection = require("../library/database");

// Get Data Table
router.get("/kelas:id", function (req, res, next) {
  var getData = `SELECT * FROM kelas${req.params.id} ORDER BY id desc`;

  // tabel tbl_kelas_10
  // SELECT * FROM tbl_siswa_${req.params.id}

  connection.query(getData, function (err, rows) {
    if (err) {
      req.flash("error", "Opps Error Bang");
      res.render("siswa", {
        data: "",
        title: req.params.id,
      });
    } else {
      res.render("siswa/index", {
        data: rows,
        title: req.params.id,
      });
    }
  });
});

// Create Data Siswa
router.get("/kelas:id/add", function (req, res, next) {
  res.render(`siswa/add`, {
    nama_siswa: "",
    alamat: "",
    telepon: "",
    image: "",

    title: req.params.id,
  });
});

// Store Data Siswa
router.post(
  "/kelas:id/store",
  upload.single("image"),
  function (req, res, next) {
    let namaSiswa = req.body.nama_siswa;
    let alamat = req.body.alamat;
    let telepon = req.body.telepon;
    // Menambahkan gambar ke dalam storage
    let image = req.file.originalname;

    let errors = false;

    if (namaSiswa.length === 0 || alamat.length === 0 || telepon.length === 0) {
      errors = true;

      req.flash("error", "Silahkan Isi Data Siswa Dengan Benar");

      res.render("siswa/add", {
        nama_siswa: namaSiswa,
        alamat: alamat,
        telepon: telepon,

        title: req.params.id,
      });
    }

    // Push Data
    if (!errors) {
      let formData = {
        nama_siswa: namaSiswa,
        alamat: alamat,
        telepon: telepon,
        image: image,
      };

      connection.query(
        `INSERT INTO kelas${req.params.id} SET ?`,
        formData,
        function (err, result) {
          if (err) {
            req.flash("error", err);

            res.render("siswa/add", {
              nama_siswa: namaSiswa,
              alamat: alamat,
              telepon: telepon,
              image: image,

              title: req.params.id,
            });
          } else {
            req.flash("success", "Data Siswa Berhasil Disimpan!");
            res.redirect(`/siswa/kelas${req.params.id}`);
          }
        }
      );
    }
  }
);

// Get Update Data
router.get("/kelas:id/edit/:idData", function (req, res, next) {
  let idData = req.params.idData;

  connection.query(
    `SELECT * FROM kelas${req.params.id} WHERE id=${idData}`,
    function (err, rows) {
      if (err) throw err;

      // Jika tidak ditemukan
      if (rows.length <= 0) {
        req.flash("error", `Data dengan ID ${idData} tidak ditemukan`);
        res.redirect(`/siswa/kelas${req.params.id}`);
      } else {
        res.render("siswa/edit", {
          id: rows[0].id,
          nama_siswa: rows[0].nama_siswa,
          alamat: rows[0].alamat,
          telepon: rows[0].telepon,
          image: rows[0].image,

          title: req.params.id,
        });
      }
    }
  );
});

// Update Data
router.post(
  "/kelas:id/update/:idData",
  upload.single("image"),
  function (req, res, next) {
    let idData = req.params.idData;
    let namaSiswa = req.body.nama_siswa;
    let alamat = req.body.alamat;
    let telepon = req.body.telepon;

    let errors = false;

    // Validasi
    if (namaSiswa.length === 0 || alamat.length === 0 || telepon.length === 0) {
      errors = true;

      req.flash("error", "Silahkan masukkan data anda");
      res.render("siswa/edit", {
        nama_siswa: namaSiswa,
        alamat: alamat,
        telepon: telepon,
      });
    }

    if (!errors) {
      connection.query(
        `SELECT image FROM kelas${req.params.id} WHERE id = ${idData}`,
        function (err, results) {
          if (err) {
            req.flash("error", err);
            res.render("siswa/edit", {
              nama_siswa: namaSiswa,
              alamat: alamat,
              telepon: telepon,
            });
          } else {
            let previousImage = results[0].image;

            if (previousImage) {
              fs.unlinkSync("public/images/" + previousImage);
            }

            let formData = {
              nama_siswa: namaSiswa,
              alamat: alamat,
              telepon: telepon,
            };

            if (req.file) {
              formData.image = req.file.originalname;
            }

            connection.query(
              `UPDATE kelas${req.params.id} SET ? WHERE id = ${idData}`,
              formData,
              function (err, result) {
                if (err) {
                  req.flash("error", err);
                  res.render("siswa/edit", {
                    nama_siswa: namaSiswa,
                    alamat: alamat,
                    telepon: telepon,
                  });
                } else {
                  req.flash("success", "Data berhasil di Edit");
                  res.redirect(`/siswa/kelas${req.params.id}`);
                }
              }
            );
          }
        }
      );
    }
  }
);

router.get("/kelas:id/delete/:idData", function (req, res, next) {
  let idData = req.params.idData;

  connection.query(
    `SELECT image FROM kelas${req.params.id} WHERE id = ${idData}`,
    function (err, result) {
      if (err) {
        req.flash("error", err);
        res.redirect(`/siswa/kelas${req.params.id}`);
      } else {
        let imageName = result[0].image;

        var deleteData = `DELETE FROM kelas${req.params.id} WHERE id = ${idData}`;
        connection.query(deleteData, function (err, result) {
          if (err) {
            req.flash("error", err);
            res.redirect(`/siswa/kelas${req.params.id}`);
          } else {
            if (imageName) {
              fs.unlinkSync(`public/images/${imageName}`);
            }

            req.flash("success", "Data Berhasil Dihapus");
            res.redirect(`/siswa/kelas${req.params.id}`);
          }
        });
      }
    }
  );
});

module.exports = router;
