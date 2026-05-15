const router  = require("express").Router();
const svc     = require("./event.service");
const { protect }   = require("../../middlewares/auth.middleware");
const { sendSuccess, sendError } = require("../../utils/response.utils");
const ah = require("../../middlewares/asyncHandler.middleware");
const { z } = require("zod");

// ── Validators ────────────────────────────────────────────────────────────────
const createSchema = z.object({
  title:       z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  location:    z.string().trim().max(200).optional(),
  eventDate:   z.string().datetime({ offset: true }).optional().or(z.literal("")),
  tags:        z.array(z.string().trim().toLowerCase()).max(5).optional(),
});

const updateSchema = createSchema.partial();

const voteSchema = z.object({
  voteType: z.enum(["up", "down"], { required_error: "voteType must be 'up' or 'down'" }),
});

// All event routes require authentication
router.use(protect);

// POST /api/events
router.post("/", ah(async (req, res) => {
  const result = createSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const event = await svc.createEvent(req.user.userId, result.data);
  return sendSuccess(res, 201, "Event created", { event });
}));

// GET /api/events?page=1&limit=20&tag=sports
router.get("/", ah(async (req, res) => {
  const data = await svc.getAllEvents(req.query);
  return sendSuccess(res, 200, "Events fetched", data);
}));

// GET /api/events/my
router.get("/my", ah(async (req, res) => {
  const data = await svc.getMyEvents(req.user.userId, req.query);
  return sendSuccess(res, 200, "Your events", data);
}));

// GET /api/events/:id
router.get("/:id", ah(async (req, res) => {
  const event = await svc.getEventById(req.params.id);
  return sendSuccess(res, 200, "Event fetched", { event });
}));

// PATCH /api/events/:id
router.patch("/:id", ah(async (req, res) => {
  const result = updateSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const event = await svc.updateEvent(req.params.id, req.user.userId, req.user.role, result.data);
  return sendSuccess(res, 200, "Event updated", { event });
}));

// DELETE /api/events/:id
router.delete("/:id", ah(async (req, res) => {
  await svc.deleteEvent(req.params.id, req.user.userId, req.user.role);
  return sendSuccess(res, 200, "Event deleted");
}));

// POST /api/events/:id/vote  { "voteType": "up" | "down" }
router.post("/:id/vote", ah(async (req, res) => {
  const result = voteSchema.safeParse(req.body);
  if (!result.success)
    return sendError(res, 400, "Validation failed", result.error.flatten().fieldErrors);

  const data = await svc.voteEvent(req.params.id, req.user.userId, result.data.voteType);
  return sendSuccess(res, 200, "Vote recorded", data);
}));

module.exports = router;
