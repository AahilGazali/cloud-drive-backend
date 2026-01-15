import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { accessLink, createLink, list, revoke, share, shareByEmailController } from "./share.controller.js";

const router = Router();

router.use(authenticate);
router.post("/", share);
router.post("/email", shareByEmailController);
router.get("/", list);
router.post("/revoke", revoke);
router.post("/link", createLink);
router.get("/link/:token", accessLink);

export default router;

