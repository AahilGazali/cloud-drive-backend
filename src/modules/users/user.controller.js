import { getUserById, listUsers } from "./user.service.js";
import { success, fail } from "../../utils/response.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) return fail(res, "Not found", 404);
    return success(res, { user });
  } catch (err) {
    return next(err);
  }
};

export const getUsers = async (_req, res, next) => {
  try {
    const users = await listUsers();
    return success(res, { users });
  } catch (err) {
    return next(err);
  }
};

