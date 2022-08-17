import { Router } from "express";
// import passport from "passport";
import driverController from "./driver.controller";

const router = Router();

// const jwt_auth = passport.authenticate("jwt", { session: false });

router.get("/drivers", driverController.get);
router.get("/drivers/:id", driverController.getById);
router.get(
  "/drivers/phone/:phone",

  driverController.getByPhone
);

router.post("/drivers", driverController.post);

router.put("/drivers/:id", driverController.put);

router.delete("/drivers/:id", driverController.delete);

module.exports = router;