const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Model
 *
 * Key decisions:
 * 1. regNo alone is NOT globally unique — FA21-BSE-001 and FA16-BSE-001 are different people.
 *    Partial unique index enforces uniqueness only among active/pending users.
 * 2. status gates login at every step.
 * 3. refreshToken stored in DB so logout truly invalidates it.
 * 4. universityId is the SaaS tenant key — every record carries it.
 */
const userSchema = new mongoose.Schema(
  {
    regNo:      { type: String, required: true, uppercase: true, trim: true },
    name:       { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    password:   { type: String, required: true, minlength: 8, select: false },

    department: { type: String, required: true, uppercase: true, trim: true },
    batch:      { type: String, uppercase: true, trim: true }, // "FA21"

    universityId: { type: String, default: "default" },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    status: {
      type: String,
      enum: ["pending", "active", "graduated", "suspended"],
      default: "pending",
      // pending   → signed up, awaiting admin approval
      // active    → verified, full access
      // graduated → read-only / blocked
      // suspended → banned
    },

    refreshToken: { type: String, select: false },
    adminNote:    { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Partial unique index ───────────────────────────────────────────────────────
// FA16-BSE-001 (graduated) + FA21-BSE-001 (active) can coexist.
// But two active users with the same regNo cannot.
userSchema.index(
  { regNo: 1, universityId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["active", "pending"] } },
    name: "unique_active_regno",
  }
);

// ── Hash password before save ─────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id:          this._id,
    regNo:        this.regNo,
    name:         this.name,
    department:   this.department,
    batch:        this.batch,
    role:         this.role,
    status:       this.status,
    universityId: this.universityId,
    createdAt:    this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
