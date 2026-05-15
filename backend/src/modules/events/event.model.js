const mongoose = require("mongoose");

/**
 * Event Model
 *
 * upvotes / downvotes are arrays of user ObjectIds.
 * A user can only appear in ONE of the two arrays at a time
 * (enforced in the service layer, not DB-level).
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title too short"],
      maxlength: [120, "Title too long"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description too long"],
    },

    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location too long"],
      default: "",
    },

    eventDate: {
      type: Date,
      default: null, // optional — not all events are time-specific
    },

    tags: [{ type: String, trim: true, lowercase: true }],

    // Who posted it
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Engagement — store user IDs, not counts (so we can toggle)
    upvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // soft-delete — keeps audit trail
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Virtuals ──────────────────────────────────────────────────────────────────
eventSchema.virtual("upvoteCount").get(function () {
  return this.upvotes.length;
});
eventSchema.virtual("downvoteCount").get(function () {
  return this.downvotes.length;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
eventSchema.index({ createdBy: 1, createdAt: -1 }); // fast "my events" queries
eventSchema.index({ createdAt: -1 });                // fast feed queries

module.exports = mongoose.model("Event", eventSchema);
