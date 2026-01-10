import { Router } from "express";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import folderRoutes from "./modules/folders/folder.routes.js";
import fileRoutes from "./modules/files/file.routes.js";
import trashRoutes from "./modules/trash/trash.routes.js"; // ✅ ADD THIS

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/folders", folderRoutes);
router.use("/files", fileRoutes);
router.use("/trash", trashRoutes); // ✅ ADD THIS

export default router;
