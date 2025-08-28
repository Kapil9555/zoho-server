// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   let token;
//   if (req.cookies.jwt) {
//     try {
//       token = req.cookies.jwt;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.userId).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   } else {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };

// export const isAdmin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) {
//     next();
//   } else {
//     res.status(403).json({ message: "Access denied. Admins only." });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
     return res.status(401).json({ message: "Not authorized, no token" });
  }

 
  // next();
};

export const isAdmin = (req, res, next) => {
  // if (req.user && req.user.isAdmin) {
  //   next();
  // } else {
  //   res.status(403).json({ message: "Access denied. Admins only." });
  // }

  // ⬇️ Temporary: allow all requests to proceed
  next();
};
