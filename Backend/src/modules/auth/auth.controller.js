import jwt from "jsonwebtoken";
import { supabase } from "../../config/supabase.js";
import { env } from "../../config/env.js";

/**
 * SIGN UP
 */
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: name ? { name } : {},
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({
    message: "User created successfully",
    userId: data.user.id,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: name || data.user.email.split('@')[0],
    },
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

  return res.json({ 
    message: "Login successful",
    token: token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email.split('@')[0],
    }
  });
};

/**
 * SIGN OUT
 */
export const signout = async (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Sign out successful' });
};

/**
 * CURRENT USER
 */
export const me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Fetch user from Supabase Auth to get metadata (name)
    const { data: userData, error } = await supabase.auth.admin.getUserById(req.user.id);
    
    if (error || !userData) {
      // Fallback to JWT data if Supabase fetch fails
      return res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name || req.user.email.split('@')[0],
        role: req.user.role,
      });
    }

    return res.json({
      id: userData.user.id,
      email: userData.user.email,
      name: userData.user.user_metadata?.name || userData.user.email.split('@')[0],
      role: req.user.role,
    });
  } catch (error) {
    // Fallback to JWT data on error
    return res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name || req.user.email.split('@')[0],
      role: req.user.role,
    });
  }
};
