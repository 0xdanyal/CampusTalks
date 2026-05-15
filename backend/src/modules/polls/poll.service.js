const Poll = require("./poll.model");

const fail = (msg, code = 400) => {
  const e = new Error(msg); e.statusCode = code; throw e;
};

// ── Create poll ───────────────────────────────────────────────────────────────
const createPoll = async (userId, { question, options, expiresAt }) => {
  const expiry = new Date(expiresAt);
  if (expiry <= new Date()) fail("Expiry date must be in the future.", 400);

  const optionDocs = options.map((text) => ({ text, votes: [] }));
  return Poll.create({ question, options: optionDocs, createdBy: userId, expiresAt: expiry });
};

// ── All active polls (not expired, not deleted) ───────────────────────────────
const getAllPolls = async ({ page = 1, limit = 20, includeExpired = false } = {}) => {
  const filter = { isDeleted: false };
  if (!includeExpired) filter.expiresAt = { $gt: new Date() };

  const skip = (Number(page) - 1) * Number(limit);

  const [polls, total] = await Promise.all([
    Poll.find(filter)
      .populate("createdBy", "name regNo department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Poll.countDocuments(filter),
  ]);

  return { polls, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } };
};

// ── My polls ──────────────────────────────────────────────────────────────────
const getMyPolls = async (userId, { page = 1, limit = 20 } = {}) => {
  const filter = { createdBy: userId, isDeleted: false };
  const skip = (Number(page) - 1) * Number(limit);

  const [polls, total] = await Promise.all([
    Poll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Poll.countDocuments(filter),
  ]);

  return { polls, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } };
};

// ── Single poll ───────────────────────────────────────────────────────────────
const getPollById = async (pollId) => {
  const poll = await Poll.findOne({ _id: pollId, isDeleted: false })
    .populate("createdBy", "name regNo department");
  if (!poll) fail("Poll not found.", 404);
  return poll;
};

// ── Vote on a poll option ─────────────────────────────────────────────────────
const votePoll = async (pollId, userId, optionId) => {
  const poll = await Poll.findOne({ _id: pollId, isDeleted: false });
  if (!poll) fail("Poll not found.", 404);

  // Check expiry
  if (new Date() > poll.expiresAt) fail("This poll has expired. Voting is closed.", 400);

  const uid = userId.toString();

  // Find which option (if any) the user already voted for
  let alreadyVotedOptionId = null;
  for (const opt of poll.options) {
    if (opt.votes.map(String).includes(uid)) {
      alreadyVotedOptionId = opt._id.toString();
      break;
    }
  }

  // Find the target option
  const targetOption = poll.options.id(optionId);
  if (!targetOption) fail("Option not found in this poll.", 404);

  const isSameOption = alreadyVotedOptionId === optionId.toString();

  if (isSameOption) {
    // Toggle off (un-vote)
    targetOption.votes.pull(userId);
  } else {
    // Remove from previous option (if any)
    if (alreadyVotedOptionId) {
      const prevOption = poll.options.id(alreadyVotedOptionId);
      if (prevOption) prevOption.votes.pull(userId);
    }
    // Add to new option
    targetOption.votes.push(userId);
  }

  await poll.save();

  // Return clean results (without exposing who voted for what)
  const results = poll.options.map((o) => ({
    _id:       o._id,
    text:      o.text,
    voteCount: o.votes.length,
    userVoted: o.votes.map(String).includes(uid),
  }));

  return { results, totalVotes: results.reduce((s, o) => s + o.voteCount, 0) };
};

// ── Delete poll (soft, owner or admin) ────────────────────────────────────────
const deletePoll = async (pollId, userId, role) => {
  const poll = await Poll.findOne({ _id: pollId, isDeleted: false });
  if (!poll) fail("Poll not found.", 404);

  const isOwner = poll.createdBy.toString() === userId.toString();
  if (!isOwner && role !== "admin") fail("Not authorised to delete this poll.", 403);

  poll.isDeleted = true;
  await poll.save();
};

module.exports = { createPoll, getAllPolls, getMyPolls, getPollById, votePoll, deletePoll };
