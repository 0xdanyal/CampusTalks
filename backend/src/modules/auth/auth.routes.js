const router = require("express").Router();
const ctrlr   = require("./auth.controller");
const { protect } = require("../../middlewares/auth.middleware");
const ah = require("../../middlewares/asyncHandler.middleware");

// Public
router.post("/signup",  ah(ctrlr.signup));
router.post("/login",   ah(ctrlr.login));
router.post("/refresh", ah(ctrlr.refresh));

// Protected
router.post("/logout", protect, ah(ctrlr.logout));
router.get("/me",      protect, ah(ctrlr.getMe));

module.exports = router;
