function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const first = String(forwarded).split(',')[0].trim();
    if (first) return first;
  }
  return req.ip || req.socket?.remoteAddress || '';
}

function getActorRole(user) {
  if (!user) return 'guest';
  if (user.role) return user.role;
  if (user.isAdmin) return 'admin';
  return 'user';
}

module.exports = { getClientIp, getActorRole };
