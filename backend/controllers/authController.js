const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER (ONLY USER) bnm
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
      role: "user", // 🔒 always user
    });

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// LOGIN (USER & ADMIN)
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 🔐 ROLE VALIDATION (IMPORTANT)
    if (role && user.role !== role) {
      return res.status(403).json({
        msg: `Access denied. You are not registered as ${role}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = { register, login };
