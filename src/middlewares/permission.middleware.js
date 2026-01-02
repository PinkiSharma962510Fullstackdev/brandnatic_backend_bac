export const checkPermission = (permissionPath) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({ message: "Access denied" });
    }

    const keys = permissionPath.split(".");
    let allowed = req.user.permissions;

    for (let key of keys) {
      allowed = allowed?.[key];
    }

    if (!allowed) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};
