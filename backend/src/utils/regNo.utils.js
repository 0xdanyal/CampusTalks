/**
 * regNo.utils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pluggable reg-number validator.
 * When selling CampusConnect to another university, only this file changes.
 *
 * Current format:  FA21-BSE-001
 *   Prefix  : FA (Fall) | SP (Spring)
 *   Year    : 2 digits
 *   Dept    : 2-4 uppercase letters
 *   Roll    : 3 digits
 */

const VALID_PREFIXES = ["FA", "SP"];

const VALID_DEPARTMENTS = [
  "BSE", "BCS", "BBA", "BCE", "BEE",
  "MCS", "MBA", "MSE", "PHD",
  // Add more as needed
];

// Master regex — FA21-BSE-001
const REGNO_REGEX = /^(FA|SP)\d{2}-[A-Z]{2,4}-\d{3}$/;

/**
 * Returns { valid: true, normalized: "FA21-BSE-001" }
 *      or { valid: false, message: "..." }
 */
const validateRegNo = (regNo) => {
  if (!regNo || typeof regNo !== "string")
    return { valid: false, message: "Registration number is required." };

  const n = regNo.trim().toUpperCase();

  if (!REGNO_REGEX.test(n))
    return { valid: false, message: "Invalid format. Expected: FA21-BSE-001" };

  const [batchPart, dept] = n.split("-");
  const prefix = batchPart.slice(0, 2);

  if (!VALID_PREFIXES.includes(prefix))
    return { valid: false, message: `Invalid semester prefix "${prefix}". Use FA or SP.` };

  if (!VALID_DEPARTMENTS.includes(dept))
    return { valid: false, message: `Department "${dept}" is not registered at this university.` };

  return { valid: true, normalized: n };
};

/**
 * Parses a valid reg number into parts.
 * FA21-BSE-001 → { prefix:"FA", year:"21", batch:"FA21", department:"BSE", rollNo:"001" }
 */
const parseRegNo = (regNo) => {
  const n = regNo.trim().toUpperCase();
  const [batchPart, department, rollNo] = n.split("-");
  return {
    prefix:     batchPart.slice(0, 2),
    year:       batchPart.slice(2),
    batch:      batchPart,
    department,
    rollNo,
  };
};

module.exports = { validateRegNo, parseRegNo, VALID_DEPARTMENTS };
