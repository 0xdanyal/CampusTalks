const mongoose = require("mongoose");

/**
 * Poll Model
 *
 * Each option stores an array of userIds who voted for it.
 * One user can only vote for ONE option (enforced in service).
 * expiresAt drives the active/expired status automatically.
 */

const optionSchema = new mongoose.Schema(
  {
    text:  { type: String, required: true, trim: true, maxlength: 200 },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Poll question is required"],
      trim: true,
      minlength: [5, "Question too short"],
      maxlength: [300, "Question too long"],
    },

    options: {
      type: [optionSchema],
      validate: {
        validator: (opts) => opts.length >= 2 && opts.length <= 6,
        message: "A poll must have between 2 and 6 options.",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Time expiry — after this, no new votes accepted
    expiresAt: {
      type: Date,
      required: [true, "Poll expiry date is required"],
    },

    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Virtual: is the poll still active? ───────────────────────────────────────
pollSchema.virtual("isActive").get(function () {
  return new Date() < this.expiresAt;
});

// ── Virtual: total votes across all options ───────────────────────────────────
pollSchema.virtual("totalVotes").get(function () {
  return this.options.reduce((sum, o) => sum + o.votes.length, 0);
});

// ── Index ─────────────────────────────────────────────────────────────────────
pollSchema.index({ createdBy: 1, createdAt: -1 });
pollSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Poll", pollSchema);
