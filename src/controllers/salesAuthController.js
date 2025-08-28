// controllers/salesAuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SalesMember from "../models/SalesMember.js";

const isProd = process.env.NODE_ENV === "production";

// Configure your token lifetime here:
// e.g. "30d", "7d", "12h" (jsonwebtoken format)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

const phoneRegex = /^\d{10}$/;

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/** Match jsonwebtoken's duration to cookie maxAge (ms). */
function parseExpiresToMs(expiresText) {
  // Very small helper: support "Xd", "Xh", "Xm"
  const m = /^(\d+)([dhm])$/.exec(expiresText);
  if (!m) return 30 * 24 * 60 * 60 * 1000; // default 30d
  const num = Number(m[1]);
  const unit = m[2];
  if (unit === "d") return num * 24 * 60 * 60 * 1000;
  if (unit === "h") return num * 60 * 60 * 1000;
  if (unit === "m") return num * 60 * 1000;
  return 30 * 24 * 60 * 60 * 1000;
}

const COOKIE_MAX_AGE = parseExpiresToMs(JWT_EXPIRES_IN);

const sendAuthCookie = (res, accessTokenSales) => {
  res.cookie("accessTokenSales", accessTokenSales, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
};

const sanitizeSalesMember = (doc) => {
  const u = doc?.toObject ? doc.toObject() : doc;
  if (!u) return null;
  delete u.password;
  return u;
};

/**
 * POST /api/sales/auth/login
 * Body:
 *  - { email, password } OR { phone, password } OR { identifier, password }
 */
export const loginSales = async (req, res, next) => {
  try {
    const { email, phone, identifier, password } = req.body || {};
    if (!password) {
      const err = new Error("Password is required");
      err.status = 400;
      throw err;
    }

    let query = null;
    if (typeof phone === "string" && phoneRegex.test(phone.trim())) {
      query = { phone: phone.trim() };
    } else if (typeof email === "string" && email.trim()) {
      query = { email: email.trim().toLowerCase() };
    } else if (typeof identifier === "string" && identifier.trim()) {
      const id = identifier.trim();
      query = phoneRegex.test(id) ? { phone: id } : { email: id.toLowerCase() };
    } else {
      const err = new Error("Provide email or phone along with password");
      err.status = 400;
      throw err;
    }

    const user = await SalesMember.findOne(query).select("+password");

    if (!user) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }
    
    if (user.isActive === false) {
      const err = new Error("Account is inactive. Contact admin.");
      err.status = 403;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      throw err;
    }

    const role = user.isAdmin ? "admin" : "sales";
    const payload = { sub: user._id.toString(), role, type: "sales" };
    const token = signToken(payload);

    sendAuthCookie(res, token);

    return res.json({
      message: "Login successful",
      user: sanitizeSalesMember(user),
    });
  } catch (err) {
    err.status = err.status || 500;
    return next(err);
  }
};

/** POST /api/sales/auth/logout */
export const logoutSales = async (req, res, next) => {
  try {
    res.clearCookie("accessTokenSales", { path: "/" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    err.status = err.status || 500;
    return next(err);
  }
};

/** GET /api/sales/auth/me */
export const meSales = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }
    const user = await SalesMember.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    return res.json({ user: sanitizeSalesMember(user) });
  } catch (err) {
    err.status = err.status || 500;
    return next(err);
  }
};
