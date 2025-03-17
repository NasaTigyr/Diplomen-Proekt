const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure upload directories exist
const ensureDirectoryExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Profile picture upload storage
const profilePictureStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/profile_pictures';
        ensureDirectoryExists(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

// Set up storage for club uploads
const clubLogoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/clubs';
        ensureDirectoryExists(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'club-' + uniqueSuffix + ext);
    }
});

// Club logo upload middleware
exports.clubUploads = multer({
    storage: clubLogoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('logo');

// Profile picture upload middleware
exports.uploadProfilePicture = multer({
    storage: profilePictureStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('profile_picture');

// Event banner upload storage
const eventBannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/events';
        ensureDirectoryExists(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'event-' + uniqueSuffix + ext);
    }
});

// Event banner upload middleware
exports.uploadEventBanner = multer({
    storage: eventBannerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).single('banner_image');
