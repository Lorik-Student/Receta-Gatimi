import signupRoute from "./signup.js";
import userProfileRoute from "./user-profiles.js";
import { Router } from "express";

const router = Router();

router.use("/signup", signupRoute);
router.use("/user-profiles", userProfileRoute);
// router.use("/recipes", recipeRoute);


export default router;