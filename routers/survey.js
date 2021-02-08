const router = require("express").Router();
const Survey = require("../models/Survey");
const Module = require("../models/Module");

const passport = require("passport");

router.post(
  "/surveys",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let survey = req.body;
      if (!survey.title) throw "Missing survey title";
      if (!survey.beginTime) throw "Missing survey begin time";
      if (!survey.endTime) throw "Missing survey end time";
      survey.authorId = req.user._id;
      survey.modules = [];
      let createdSurvey = await Survey.create(survey);
      res.status(200).send(createdSurvey);
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.get(
  "/surveys",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let surveys = await Survey.find({ authorId: req.user._id });
      if (!surveys) {
        res.status(404).send({ msg: "Surveys not found" });
      } else {
        res.status(200).send(surveys.map((survey) => survey._id));
      }
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.get(
  "/surveys/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let survey = await Survey.findById(req.params.id);

      if (!survey) {
        res.status(404).send({ msg: "Survey not found" });
        return;
      }

      let modules = await Module.find({ surveyId: req.params.id });
      if (!req.query.populateModules)
        modules = modules.map((module) => module._id);
      survey.modules = modules;
      res.status(200).send(survey);
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.put(
  "/surveys/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let survey = await Survey.findById(req.params.id);
      if (!survey) {
        res.status(404).send({ msg: "Survey not found" });
      } else if (survey.authorId !== req.user._id) {
        res.status(401).send({ msg: "Unauthorized!" });
      } else {
        if (req.body.title) survey.title = req.body.title;
        if (req.body.detail) survey.detail = req.body.detail;
        if (req.body.beginTime) survey.beginTime = req.body.beginTime;
        if (req.body.endTime) survey.endTime = req.body.endTime;

        // verify Time
        let errMsg;
        if (
          Object.prototype.toString.call(survey.beginTime) !== "[object Date]"
        )
          errMsg = "Invalid beginTime";
        else if (
          Object.prototype.toString.call(survey.endTime) !== "[object Date]"
        )
          errMsg = "Invalid endTime";
        else if (survey.endTime.valueOf() <= survey.beginTime.valueOf())
          errMsg = "endTime is eariler than startTime";
        if (errMsg) {
          res.status(400).send({ msg: errMsg });
          return;
        }

        // update survey
        await survey.save();
        res.status(200).send(survey);
      }
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.delete(
  "/surveys/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let survey = await Survey.findById(req.params.id);
      if (!survey) {
        res.status(404).send({ msg: "Survey not found" });
      } else if (survey.authorId !== req.user._id) {
        res.status(401).send({ msg: "Unauthorized!" });
      } else {
        await Survey.findByIdAndDelete(req.params.id);
        res.status(200).send({ msg: "Success" });
      }
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

module.exports = router;
