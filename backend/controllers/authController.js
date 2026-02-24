const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const normalizeRole = (role) => String(role || "").trim().toUpperCase();

// REGISTER (ONLY USER)
const register = async (req, res) => {
  try {
    const { fullname, company, email, phone, password } = req.body;

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
  } catch (_err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN (USER, ADMIN, SUPER_ADMIN)
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const normalizedUserRole = normalizeRole(user.role);
    const normalizedRequestedRole = normalizeRole(role);

    if (normalizedRequestedRole && normalizedUserRole !== normalizedRequestedRole) {
      return res.status(403).json({
        msg: `Access denied. You are not registered as ${normalizedRequestedRole}`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: normalizedUserRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      token,
      role: normalizedUserRole
    });
  } catch (_err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { register, login };
