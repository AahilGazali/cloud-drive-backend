import { searchByName } from "./search.service.js";
import { success } from "../../utils/response.js";

export const search = async (req, res, next) => {
  try {
    const term = req.query.q || "";
    const results = await searchByName(req.user.id, term);
    return success(res, results);
  } catch (err) {
    return next(err);
  }
};

