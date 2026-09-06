const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getDatabaseErrorMessage } = require("../utils/dbError");
const connectDB = require("../utils/db");

const normalizeRole = (role) => String(role || "").trim().toUpperCase();
const isDemoAuthEnabled = () => String(process.env.DEMO_AUTH_ENABLED || "false").toLowerCase() === "true";

const createTokenForUser = (user) => jwt.sign(
  {
    id: user.id,
    role: user.role,
    fullname: user.fullname,
    email: user.email,
    demo: Boolean(user.demo)
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

const getDemoUserId = (email) => crypto
  .createHash("md5")
  .update(String(email || "").toLowerCase())
  .digest("hex")
  .slice(0, 24);

const loginWithDemoUser = ({ email, password, role }) => {
  if (!isDemoAuthEnabled()) {
    return null;
  }

  const normalizedRequestedRole = normalizeRole(role) || "USER";
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const demoEmail = String(process.env.DEMO_LOGIN_EMAIL || process.env.DEMO_ADMIN_EMAIL || "").trim().toLowerCase();
  const demoPassword = String(process.env.DEMO_LOGIN_PASSWORD || process.env.DEMO_ADMIN_PASSWORD || "");
  const demoRole = normalizeRole(process.env.DEMO_LOGIN_ROLE || process.env.DEMO_ADMIN_ROLE || "ADMIN");

  if (!demoEmail || !demoPassword || !normalizedEmail || !password) {
    return null;
  }

  if (
    normalizedEmail !== demoEmail ||
    password !== demoPassword ||
    normalizedRequestedRole !== demoRole
  ) {
    return null;
  }

  const publicUser = {
    id: getDemoUserId(normalizedEmail),
    fullname: normalizedEmail.split("@")[0] || "Demo User",
    email: normalizedEmail,
    company: "Demo Company",
    role: normalizedRequestedRole,
    demo: true
  };

  return {
    success: true,
    token: createTokenForUser(publicUser),
    role: normalizedRequestedRole,
    user: publicUser,
    demo: true
  };
};

// REGISTER (ONLY USER)
const register = async (req, res) => {
  try {
    const { fullname, company, email, phone, password } = req.body;

    await connectDB();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      company,
      email,
      phone,
      password: hashedPassword,
      role: "USER"
    });

    return res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      msg: getDatabaseErrorMessage(error)
    });
  }
};

// LOGIN (USER, ADMIN, SUPER_ADMIN)
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRequestedRole = normalizeRole(role);

    const demoLogin = loginWithDemoUser(req.body);
    if (demoLogin) {
      return res.json(demoLogin);
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const normalizedUserRole = normalizeRole(user.role);

    if (normalizedRequestedRole && normalizedUserRole !== normalizedRequestedRole) {
      return res.status(403).json({
        msg: `Access denied. You are not registered as ${normalizedRequestedRole}`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const publicUser = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      company: user.company,
      role: normalizedUserRole
    };

    const token = createTokenForUser({
      id: user._id,
      role: normalizedUserRole,
      fullname: user.fullname,
      email: user.email
    });

    return res.json({
      success: true,
      token,
      role: normalizedUserRole,
      user: publicUser
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      msg: getDatabaseErrorMessage(error)
    });
  }
};

module.exports = { register, login };
