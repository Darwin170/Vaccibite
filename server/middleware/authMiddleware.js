const jwt = require("jsonwebtoken");
const User = require('../model/usermode');
const M_User = require("../model/M_user");

const authMiddleware = async (req, res,next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      req.MuserId = user._id;
      req.userType = "UserAccounts"; // ✅ web user
    } else {
      let mobile_user = await M_User.findById(decoded.id);// ✅ Corrected this line
      if (!mobile_user) {
        return res.status(401).json({ message: "Invalid user" });
      }
      req.user = mobile_user;
      req.MuserId = mobile_user._id;
      req.userType = "Mobile_User"; // ✅ mobile user
    }
        next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }


};

module.exports = { authMiddleware };

console.log("Find me",authMiddleware);

