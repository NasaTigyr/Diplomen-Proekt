const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload instances for different use cases
const upload = multer({ storage: storage });

// Specialized upload configurations
upload.clubUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'certification', maxCount: 1 },
  { name: 'coach_certification', maxCount: 1 }
]);

upload.eventUpload = upload.fields([
  {name: 'timetable_file', maxCount: 1},
  {name: 'banner_image_file', maxCount: 1}
]);

module.exports = upload;
