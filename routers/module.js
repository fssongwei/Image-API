const router = require("express").Router();
const Module = require("../models/Module");
const Survey = require("../models/Survey");

const passport = require("passport");

router.post(
  "/modules",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let module = req.body;
      let survey = await Survey.findById(module.surveyId);
      if (!survey) {
        res.status(404).send({ msg: "Survey not found!" });
        return;
      }
      if (survey.authorId !== req.user._id) {
        res.status(401).send({ msg: "Unauthorized!" });
        return;
      }
      if (!module.type) {
        res.status(400).send({ msg: "Missing type!" });
        return;
      }

      let setting;
      if (module.type === "input") {
        setting = {
          placeholder: "Default Placeholder",
          wordCountLimit: null,
        };
      } else if (module.type === "textarea") {
        setting = {
          placeholder: "Default Placeholder",
          wordCountLimit: null,
          inputRowNum: 3,
        };
      } else if (module.type === "number") {
        setting = {
          default: 0,
          lowerLimit: null,
          upperLimit: null,
        };
      } else if (module.type === "date") {
        setting = {
          default: new Date(),
          lowerLimit: null,
          upperLimit: null,
        };
      } else if (
        module.type === "radio" ||
        module.type === "checkbox" ||
        module.type === "dropbox"
      ) {
        setting = {
          options: [
            {
              key: "A",
              label: "option 1",
            },
            {
              key: "B",
              label: "option 2",
            },
            {
              key: "C",
              label: "option 3",
            },
            {
              key: "D",
              label: "option 4",
            },
          ],
        };
      }

      module.setting = setting;
      let createdModule = await Module.create(module);
      res.status(200).send(createdModule);
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.delete(
  "/modules/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let module = await Module.findById(req.params.id);
      if (!module) {
        res.status(404).send({ msg: "Module not found!" });
        return;
      }

      let survey = await Survey.findById(module.surveyId);
      if (survey.authorId !== req.user._id) {
        res.status(401).send({ msg: "Unauthorized!" });
        return;
      }

      await Module.findByIdAndDelete(req.params.id);
      res.status(200).send({ msg: "Success" });
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.put(
  "/modules/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let foundModule = await Module.findById(req.params.id);
      if (!foundModule) {
        res.status(404).send({ msg: "Module not found!" });
        return;
      }

      let survey = await Survey.findById(foundModule.surveyId);
      if (survey.authorId !== req.user._id) {
        res.status(401).send({ msg: "Unauthorized!" });
        return;
      }

      let module = req.body;

      if (module.title) {
        foundModule.title = module.title;
      }

      if (module.required) {
        foundModule.required = module.required;
      }

      if (module.setting) {
        let setting = module.setting;
        let foundSetting = foundModule.setting;
        for (let prop of Object.getOwnPropertyNames(foundSetting)) {
          if (setting[prop] !== undefined) {
            foundSetting[prop] = setting[prop];
          }
        }
      }

      await foundModule.save();
      res.status(200).send(foundModule);
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

router.get(
  "/modules/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let foundModule = await Module.findById(req.params.id);
      if (!foundModule) {
        res.status(404).send({ msg: "Module not found!" });
        return;
      }

      let survey = await Survey.findById(foundModule.surveyId);
      if (survey.authorId !== req.user._id) {
        res.status(401).send({ msg: "Unauthorized!" });
        return;
      }
      res.status(200).send(foundModule);
    } catch (error) {
      res.status(500).send({ msg: error.toString() });
    }
  }
);

module.exports = router;

// 可选：input（单行文本框）、textarea（多行文本框）、number（数字）、date（日期）、radio（单选框）、checkbox（多选框）、dropbox（下拉框）
