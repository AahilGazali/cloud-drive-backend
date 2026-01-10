import jwt from "jsonwebtoken";
import { supabase } from "../../config/supabase.js";
import { env } from "../../config/env.js";

/**
 * SIGN UP
 */
export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({
    message: "User created successfully",
    userId: data.user.id,
  });
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: data.user.id,
      email: data.user.email,
      role: "user",
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  return res.json({ message: "Login successful" });
};

/**
 * CURRENT USER
 */
export const me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });
};
