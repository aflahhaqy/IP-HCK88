/**
 * Authorization middleware untuk role-based access control
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['Customer', 'Staff', 'Admin'])
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Unauthorized. Please login first.",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: `Forbidden. This endpoint requires one of these roles: ${allowedRoles.join(
            ", "
          )}`,
          yourRole: req.user.role,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = authorize;
