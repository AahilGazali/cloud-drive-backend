import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { fail } from "../utils/response.js";

export const authenticate = (req, res, next) => {
  try {
    // Check for token in Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookie
      token = req.cookies?.token;
    }
    
    if (!token) return fail(res, "Unauthorized", 401);

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return fail(res, "Unauthorized", 401);
  }
};

export const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return fail(res, "Unauthorized", 401);
  if (!roles.length || roles.includes(req.user.role)) return next();
  return fail(res, "Forbidden", 403);
};

