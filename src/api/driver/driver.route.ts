import { Router } from "express";
import { validateToken } from "../../middlewares/authen";
// import passport from "passport";
import driverController from "./driver.controller";

const router = Router();
const authenMiddleware = validateToken("USER");

// const jwt_auth = passport.authenticate("jwt", { session: false });

router.get("/drivers", authenMiddleware, driverController.get);
router.get("/drivers/:id", authenMiddleware, driverController.getById);
router.get(
  "/drivers/phone/:phone",
  authenMiddleware,
  driverController.getByPhone
);

router.post("/drivers", authenMiddleware, driverController.post);
router.post("/drivers/booking", authenMiddleware, driverController.booking);

router.put("/drivers/accept", authenMiddleware, driverController.acceptBooking);
router.put("/drivers/done", authenMiddleware, driverController.doneBooking);
router.put("/drivers/cancel", authenMiddleware, driverController.cancelBooking);
router.put("/drivers/:id", authenMiddleware, driverController.put);

router.delete("/drivers/:id", authenMiddleware, driverController.delete);

module.exports = router;
