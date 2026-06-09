import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// ─────────────────────────────────────────────
// STORAGE: IMAGES
// ─────────────────────────────────────────────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const employeeId = req.user?.employeeId || 'unknown';
    return {
      folder: `fieldtrack/images/${employeeId}`,
      resource_type: 'image',
      public_id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };
  },
});

// ─────────────────────────────────────────────
// STORAGE: AUDIO
// ─────────────────────────────────────────────
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const employeeId = req.user?.employeeId || 'unknown';
    return {
      folder: `fieldtrack/audio/${employeeId}`,
      resource_type: 'video', // Audio stored as video in Cloudinary
      public_id: `audio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
  },
});

// ─────────────────────────────────────────────
// FILE FILTERS (validate MIME type before upload)
// ─────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type: ${file.mimetype}. Allowed: jpg, png, webp, gif`), false);
  }
};

const audioFilter = (req, file, cb) => {
  const allowed = [
    'audio/mpeg',       // .mp3
    'audio/wav',        // .wav
    'audio/mp4',        // .m4a
    'audio/ogg',        // .ogg
    'audio/webm',       // .webm from browser MediaRecorder
    'audio/aac',        // .aac
    'video/webm',       // Some browsers send this for MediaRecorder audio
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid audio type: ${file.mimetype}`), false);
  }
};

// ─────────────────────────────────────────────
// MULTER UPLOAD INSTANCES
// ─────────────────────────────────────────────
export const uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
}).array('shopImages', 5);

export const uploadEmployeeAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
}).single('employeeVoiceRecording');

export const uploadShopAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single('shopVoiceRecording');

// Single generic media upload (used by entries.js endpoint upload.single('mediaFile'))
const combinedStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const employeeId = req.user?.employeeId || 'unknown';
    const isAudio = file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm';
    return {
      folder: `fieldtrack/${isAudio ? 'audio' : 'images'}/${employeeId}`,
      resource_type: isAudio ? 'video' : 'image',
      public_id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
  },
});

export const uploadGenericMedia = multer({
  storage: combinedStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
}).single('mediaFile');
