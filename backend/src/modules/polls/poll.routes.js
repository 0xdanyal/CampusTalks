const router = require("express").Router();
const svc    = require("./poll.service");
const { protect }   = require("../../middlewares/auth.middleware");
const { sendSuccess, sendError } = require("../../utils/response.utils");
const ah = require("../../middlewares/asyncHandler.middleware");
const { z } = require("zod");

// ── Validators ────────────────────────────────────────────────────────────────
const createSchema = z.object({
  question:  z.string().trim().min(5).max(300),
  options:   z.array(z.string().trim().min(1).max(200)).min(2).max(6),
  expiresAt: z.string().datetime({ offset: true, message: "expiresAt must be a valid ISO datetime" }),
});

const voteSchema = z.object({
  optionId: z.string({ required_error: "optionId is required" }),
});

// All poll routes require authentication
router.use(protect);

// POST /api/polls
router.post("/", ah(async (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const poll = await svc.createPoll(req.user.userId, result.data);
  return sendSuccess(res, 201, "Poll created", { poll });
}));

// GET /api/polls?page=1&limit=20&includeExpired=false
router.get("/", ah(async (req, res) => {
  const includeExpired = req.query.includeExpired === "true";
  const data = await svc.getAllPolls({ ...req.query, includeExpired });
  return sendSuccess(res, 200, "Polls fetched", data);
}));

// GET /api/polls/my
router.get("/my", ah(async (req, res) => {
  const data = await svc.getMyPolls(req.user.userId, req.query);
  return sendSuccess(res, 200, "Your polls", data);
}));

// GET /api/polls/:id
router.get("/:id", ah(async (req, res) => {
  const poll = await svc.getPollById(req.params.id);
  return sendSuccess(res, 200, "Poll fetched", { poll });
}));

// POST /api/polls/:id/vote  { "optionId": "..." }
router.post("/:id/vote", ah(async (req, res) => {
  const result = voteSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const data = await svc.votePoll(req.params.id, req.user.userId, result.data.optionId);
  return sendSuccess(res, 200, "Vote recorded", data);
}));

// DELETE /api/polls/:id
router.delete("/:id", ah(async (req, res) => {
  await svc.deletePoll(req.params.id, req.user.userId, req.user.role);
  return sendSuccess(res, 200, "Poll deleted");
}));

module.exports = router;
