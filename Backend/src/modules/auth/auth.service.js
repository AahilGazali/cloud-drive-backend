import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "../../config/db.js";
import { env } from "../../config/env.js";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerUser = async (payload) => {
  const { email, password } = authSchema.parse(payload);
  const hashed = await bcrypt.hash(password, 10);
  const insert =
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role";
  const { rows } = await query(insert, [email, hashed, "user"]);
  return rows[0];
};

export const authenticateUser = async (payload) => {
  const { email, password } = authSchema.parse(payload);
  const { rows } = await query("SELECT * FROM users WHERE email=$1", [email]);
  const user = rows[0];
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
};

export const issueTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

