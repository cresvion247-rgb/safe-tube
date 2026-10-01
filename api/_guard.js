// Optional request guard. Default behaviour is unchanged.
// Set REQUIRE_PARENT_AUTH=true in Vercel to reject calls without a Bearer token.
// Set ALLOWED_ORIGIN to your site to reject other websites. Empty means allow.

export function applyGuard(req, res) {
  const origin = req.headers.origin || "";
  const allowed = process.env.ALLOWED_ORIGIN || "";
  if (allowed && origin && origin !== allowed) {
    res.status(403).json({ ok: false, error: "Origin not allowed.", code: "FORBIDDEN" });
    return false;
  }
  if (process.env.REQUIRE_PARENT_AUTH === "true") {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ") || header.length < 20) {
      res.status(401).json({ ok: false, error: "Parent sign-in required.", code: "UNAUTHORIZED" });
      return false;
    }
  }
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");
  return true;
}
