import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Make sure env variables are loaded

const verifyToken = (req, res, next) => {
  try {
    // Only use Authorization header since frontend doesn't use cookies
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token found in Authorization header");
      return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
    }

    // Extract token part (after "Bearer ")
    let token = authHeader.split(" ")[1];

    // Clean token from potential wrapping quotes or whitespace
    token = token.trim().replace(/^"(.*)"$/, "$1");

    console.log("Cleaned token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    if (!decoded?.id || !decoded?.role) {
      console.log("Invalid token structure or missing id/role");
      return res.status(403).json({ success: false, message: "Unauthorized - Invalid token structure" });
    }

    req.userId = decoded.id;
    req.user = { role: decoded.role, accountType: decoded.accountType };

    console.log("Authorization Header:", authHeader);

    next();
  } catch (error) {
    console.error("Error in verifyToken:", error.message);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

export default verifyToken;
