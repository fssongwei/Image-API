const fs = require("fs");
const router = require("express").Router();
const Flashcard = require("../models/User");
const passport = require("passport");
const Image = require("../models/Image");

const jwt = require("jsonwebtoken");
const multer = require("multer");

const generateFileName = (file) => {
  let fileName = Math.random().toString(36).slice(-8);
  let index = file.originalname.lastIndexOf(".");
  if (index < 0) return fileName;
  let format = file.originalname.substring(index);
  fileName += format;
  return fileName;
};

const storage = multer.diskStorage({
  destination: "public/images",
  filename: function (req, file, cb) {
    let fileName = generateFileName(file);
    req.fileName = fileName;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

const updateDatabase = async (req, res, next) => {
  try {
    await Image.create({
      owner: req.user,
      fileName: req.fileName,
    });
    next();
  } catch (error) {
    res.status(500).send(error);
  }
};

router.post(
  "/image",
  passport.authenticate("jwt", { session: false }),
  upload.single("img"),
  updateDatabase,
  async (req, res) => {
    try {
      let imageUrl = process.env.HOST + "/images/" + req.fileName;
      res.status(200).send(imageUrl);
    } catch (error) {
      console.log(error.toString());
      res.status(500).send(error);
    }
  }
);

router.get(
  "/image",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let imageNameList = await Image.find({ owner: req.user });
      let imageUrlList = imageNameList.map(
        (record) => process.env.HOST + "/images/" + record.fileName
      );
      res.status(200).send(imageUrlList);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

router.delete(
  "/image/:fileName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let image = await (
        await Image.findOne({ fileName: req.params.fileName })
      ).execPopulate("owner");
      if (!image) throw "Not Found";
      if (image.owner._id.toString() !== req.user._id) throw "Unauthorized";
      fs.unlinkSync(
        __dirname + "/.." + "/public/images/" + req.params.fileName
      );
      await image.remove();
      res.status(200).send("success");
    } catch (error) {
      console.log(error.toString());
      res.status(500).send(error);
    }
  }
);

module.exports = router;
