const mongoose = require('mongoose');

const IntakeFormSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicalHistory: { type: String, required: true },
  insurance: { type: String, required: true },
  symptoms: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IntakeForm', IntakeFormSchema);
