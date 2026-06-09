import mongoose from 'mongoose';

const fieldEntrySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  employeeId: String,
  placeOfWork: {
    type: String,
    required: true,
  },
  dateOfVisit: {
    type: Date,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  shopDetails: {
    name: {
      type: String,
      required: true,
    },
    ownerName: String,
    address: String,
    phoneNumber: String,
    category: String,
  },
  media: {
    images: [{
      type: String, // URL/Path to stored image
    }],
    employeeVoiceNote: {
      type: String, // URL/Path to stored audio file
    },
    shopRepVoiceNote: {
      type: String, // URL/Path to stored audio file
    },
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted'],
    default: 'Draft',
  },
}, {
  timestamps: true,
});

const FieldEntry = mongoose.model('FieldEntry', fieldEntrySchema);
export default FieldEntry;
