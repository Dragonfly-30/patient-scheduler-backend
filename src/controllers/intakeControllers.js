const IntakeForm = require('../models/formintake');

// Submit intake form
const submitIntakeForm = async (req, res) => {
  try {
    const { medicalHistory, insurance, symptoms } = req.body;

    if (!medicalHistory || !insurance || !symptoms) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newForm = new IntakeForm({
      patient: req.user.id,
      medicalHistory,
      insurance,
      symptoms
    });

    await newForm.save();

    res.status(201).json({
      success: true,
      message: "Intake form submitted successfully",
      form: newForm
    });
  } catch (error) {
    console.log("Error in submitIntakeForm:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all intake forms of a patient
const getPatientIntakeForms = async (req, res) => {
  try {
    const forms = await IntakeForm.find({ patient: req.user.id });
    res.status(200).json({ success: true, count: forms.length, forms });
  } catch (error) {
    console.log("Error in getPatientIntakeForms:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ADDED: Get all intake forms for admin
const getAllIntakeForms = async (req, res) => {
  console.log('=== GET ALL INTAKE FORMS CONTROLLER ===');
  console.log('Admin user:', req.user);
  
  try {
    const forms = await IntakeForm.find({})
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Successfully fetched ${forms.length} intake forms`);
    
    res.status(200).json({
      success: true,
      count: forms.length,
      forms
    });
  } catch (error) {
    console.error('Error in getAllIntakeForms controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch intake forms',
      error: error.message
    });
  }
};

// UPDATED: Export all functions including the new one
module.exports = { 
  submitIntakeForm, 
  getPatientIntakeForms,
  getAllIntakeForms  // ADDED this export
};