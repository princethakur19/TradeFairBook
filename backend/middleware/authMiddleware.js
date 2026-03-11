const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      role: String(decoded.role || "").toUpperCase()
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};

exports.optionalProtect = (req, _res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer")) {
    return next();
  }

  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...decoded,
      role: String(decoded.role || "").toUpperCase()
    };
  } catch (_error) {
    req.user = undefined;
  }

  next();
};

exports.adminOnly = (req, res, next) => {
  return exports.authorizeRoles("ADMIN", "SUPER_ADMIN")(req, res, next);
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const normalizedAllowedRoles = roles.map((role) => String(role).toUpperCase());
  if (!normalizedAllowedRoles.includes(String(req.user.role || "").toUpperCase())) {
    return res.status(403).json({ message: "You are not allowed to access this resource" });
  }

  next();
};
