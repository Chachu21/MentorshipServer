import jwt from "jsonwebtoken";
import User from "../models/users.js"; // Adjust the path as needed

export const verifyToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ message: "No authorization header provided" });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: err.message, status: err.status });
  }
};
