import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB - increased for video uploads
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types including videos
    cb(null, true);
  },
});
