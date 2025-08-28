// middleware/salesAuth.js
import jwt from "jsonwebtoken";

export const requireSalesAuth = (req, res, next) => {
  try {
    let token = req.cookies?.accessTokenSales;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "sales") {
      const err = new Error("Wrong auth domain");
      err.status = 403;
      throw err;
    }
    req.user = decoded;
    return next();
  } catch (err) {
    err.status = 401;
    return next(err);
  }
};

export const requireSalesRole = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    return next(err);
  }
  return next();
};
