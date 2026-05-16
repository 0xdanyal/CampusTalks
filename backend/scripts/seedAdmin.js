/**
 * scripts/seedAdmin.js
 * Run ONCE to create the first admin account.
 * Usage: node scripts/seedAdmin.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../src/modules/users/user.model");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      console.log("⚠️  Admin already exists:", existing.regNo);
      return process.exit(0);
    }

    const admin = await User.create({
      regNo:        "ADMIN-001",
      name:         "CampusTalks Admin",
      password:     process.env.ADMIN_PASSWORD || "Admin@12345",
      department:   "ADMIN",
      batch:        "ADMIN",
      role:         "admin",
      status:       "active",
      universityId: process.env.UNIVERSITY_ID || "default",
    });

    console.log("🎉 Admin created!");
    console.log("   RegNo   :", admin.regNo);
    console.log("   Password:", process.env.ADMIN_PASSWORD || "Admin@12345");
    console.log("   ⚠️  Change this password after first login!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
})();
