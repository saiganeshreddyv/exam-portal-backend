// export const facultyAuth = (req, res, next) => {
//   // TEMPORARY: replace with JWT later
//   const facultyId =
//     req.user?.id ||
//     Number(req.headers["x-faculty-id"]);

//   if (!facultyId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   req.facultyId = facultyId;
//   next();
// };

export const facultyAuth = (req, res, next) => {
  const facultyId = req.user?.id;

  if (!facultyId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.facultyId = facultyId;
  next();
};
