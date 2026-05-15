const Event = require("./event.model");

const fail = (msg, code = 400) => {
  const e = new Error(msg); e.statusCode = code; throw e;
};

// ── Create event ──────────────────────────────────────────────────────────────
const createEvent = async (userId, body) => {
  const { title, description, location, eventDate, tags } = body;
  return Event.create({ title, description, location, eventDate, tags, createdBy: userId });
};

// ── All events feed (newest first, paginated) ─────────────────────────────────
const getAllEvents = async ({ page = 1, limit = 20, tag } = {}) => {
  const filter = { isDeleted: false };
  if (tag) filter.tags = tag.toLowerCase();

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate("createdBy", "name regNo department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Event.countDocuments(filter),
  ]);

  return { events, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } };
};

// ── My events (student's own dashboard) ──────────────────────────────────────
const getMyEvents = async (userId, { page = 1, limit = 20 } = {}) => {
  const filter = { createdBy: userId, isDeleted: false };
  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Event.countDocuments(filter),
  ]);

  return { events, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } };
};

// ── Single event ──────────────────────────────────────────────────────────────
const getEventById = async (eventId) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false })
    .populate("createdBy", "name regNo department");
  if (!event) fail("Event not found.", 404);
  return event;
};

// ── Edit event (owner or admin only) ─────────────────────────────────────────
const updateEvent = async (eventId, userId, role, body) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) fail("Event not found.", 404);

  const isOwner = event.createdBy.toString() === userId.toString();
  if (!isOwner && role !== "admin") fail("Not authorised to edit this event.", 403);

  const allowed = ["title", "description", "location", "eventDate", "tags"];
  allowed.forEach((field) => {
    if (body[field] !== undefined) event[field] = body[field];
  });

  await event.save();
  return event;
};

// ── Delete event (soft-delete, owner or admin) ────────────────────────────────
const deleteEvent = async (eventId, userId, role) => {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) fail("Event not found.", 404);

  const isOwner = event.createdBy.toString() === userId.toString();
  if (!isOwner && role !== "admin") fail("Not authorised to delete this event.", 403);

  event.isDeleted = true;
  await event.save();
};

// ── Upvote / downvote (toggle) ────────────────────────────────────────────────
const voteEvent = async (eventId, userId, voteType) => {
  // voteType: "up" | "down"
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) fail("Event not found.", 404);

  const uid = userId.toString();
  const hasUpvoted   = event.upvotes.map(String).includes(uid);
  const hasDownvoted = event.downvotes.map(String).includes(uid);

  if (voteType === "up") {
    if (hasUpvoted) {
      // Toggle off
      event.upvotes.pull(userId);
    } else {
      event.upvotes.push(userId);
      if (hasDownvoted) event.downvotes.pull(userId); // remove opposite
    }
  } else if (voteType === "down") {
    if (hasDownvoted) {
      event.downvotes.pull(userId);
    } else {
      event.downvotes.push(userId);
      if (hasUpvoted) event.upvotes.pull(userId);
    }
  } else {
    fail("voteType must be 'up' or 'down'.", 400);
  }

  await event.save();

  return {
    upvoteCount:   event.upvotes.length,
    downvoteCount: event.downvotes.length,
    userVote: event.upvotes.map(String).includes(uid)
      ? "up"
      : event.downvotes.map(String).includes(uid)
      ? "down"
      : null,
  };
};

module.exports = { createEvent, getAllEvents, getMyEvents, getEventById, updateEvent, deleteEvent, voteEvent };
