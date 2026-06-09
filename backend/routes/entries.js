import express from 'express';
import FieldEntry from '../models/FieldEntry.js';
import { protect } from '../middleware/auth.js';
import { uploadGenericMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @desc    Upload media files to Cloudinary
// @route   POST /api/entries/upload
// @access  Private
router.post('/upload', protect, uploadGenericMedia, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Enforce 5MB limit for images
  if (req.file.mimetype.startsWith('image/') && req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ message: 'Image size exceeds the 5MB limit.' });
  }
  // Cloudinary storage puts secure URL in file.path
  const fileUrl = req.file.path;
  res.json({ fileUrl });
});

// @desc    Get all field entries for the logged-in user
// @route   GET /api/entries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { employee: req.user._id };
    const entries = await FieldEntry.find(filter)
      .populate('employee', 'name employeeId email')
      .sort({ updatedAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Fetch entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get a single entry by ID
// @route   GET /api/entries/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const entry = await FieldEntry.findOne({ _id: req.id || req.params.id, employee: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    console.error('Fetch single entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new field entry (Draft or Submitted)
// @route   POST /api/entries
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      employeeName,
      employeeId,
      placeOfWork,
      dateOfVisit,
      location,
      shopDetails,
      media,
      status
    } = req.body;

    const entry = new FieldEntry({
      employee: req.user._id,
      employeeName: employeeName || req.user.name,
      employeeId: employeeId || req.user.employeeId,
      placeOfWork,
      dateOfVisit,
      location,
      shopDetails,
      media,
      status: status || 'Draft'
    });

    const savedEntry = await entry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
});

// @desc    Update a field entry
// @route   PUT /api/entries/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const entry = await FieldEntry.findOne({ _id: req.params.id, employee: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const {
      employeeName,
      employeeId,
      placeOfWork,
      dateOfVisit,
      location,
      shopDetails,
      media,
      status
    } = req.body;

    if (employeeName !== undefined) entry.employeeName = employeeName;
    if (employeeId !== undefined) entry.employeeId = employeeId;
    if (placeOfWork !== undefined) entry.placeOfWork = placeOfWork;
    if (dateOfVisit !== undefined) entry.dateOfVisit = dateOfVisit;
    if (location !== undefined) entry.location = location;
    if (shopDetails !== undefined) entry.shopDetails = shopDetails;
    if (media !== undefined) entry.media = media;
    if (status !== undefined) entry.status = status;

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
});

// @desc    Delete a field entry
// @route   DELETE /api/entries/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const entry = await FieldEntry.findOne({ _id: req.params.id, employee: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    await entry.deleteOne();
    res.json({ message: 'Entry removed successfully' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
