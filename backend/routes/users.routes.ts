import { Router } from "express";
import * as Controller from "../controllers/user.controller.js";
const router = Router();

router.get("/:id", Controller.getUserProfile);
router.get("/", Controller.getAllUserProfiles);


export default router;