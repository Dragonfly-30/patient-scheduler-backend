const express = require("express");
const router = express.Router();
const IntakeForm = require('../models/formintake'); // FIXED: Correct path to your model

const { auth } = require('../middlewares/authmiddleware');
const { ispatient, isadmin } = require('../middlewares/rolemiddleware');

// Import controllers with error handling
let submitIntakeForm, getPatientIntakeForms;

try {
  const controllers = require('../controllers/intakeControllers');
  ({ submitIntakeForm, getPatientIntakeForms } = controllers);
  console.log('Intake controllers imported successfully');
  console.log('Controller types:', {
    submitIntakeForm: typeof submitIntakeForm,
    getPatientIntakeForms: typeof getPatientIntakeForms
  });
} catch (error) {
  console.log('Controller import failed:', error.message);
}

// Test route to check routes file is working
router.get('/test', (req, res) => {
  console.log('=== INTAKE ROUTE TEST HIT ===');
  res.json({
    success: true,
    message: 'Intake routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Test auth middleware
router.get('/auth-test', auth, (req, res) => {
  console.log('=== INTAKE AUTH TEST HIT ===');
  console.log('User from auth:', req.user);
  res.json({
    success: true,
    message: 'Authentication working!',
    user: req.user
  });
});

// Patient submits intake form
router.post('/submit', auth, ispatient, submitIntakeForm);

// Patient views their intake forms
router.get('/forms', auth, ispatient, getPatientIntakeForms);

// Admin route to view all intake forms
router.get('/admin/forms', auth, isadmin, async (req, res) => {
  console.log('=== ADMIN FORMS ROUTE HIT ===');
  console.log('User making request:', req.user);
  
  try {
    console.log('Attempting to fetch all intake forms...');
    const forms = await IntakeForm.find({})
      .populate('patient', 'name email')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`Found ${forms.length} intake forms`);
    
    if (forms.length > 0) {
      console.log('Sample form:', {
        id: forms[0]._id,
        patient: forms[0].patient,
        symptoms: forms[0].symptoms?.substring(0, 50) + '...',
        createdAt: forms[0].createdAt
      });
    }

    res.status(200).json({ 
      success: true, 
      count: forms.length, 
      forms 
    });
  } catch (error) {
    console.error("Error in getAllIntakeForms:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching intake forms", 
      error: error.message 
    });
  }
});

module.exports = router;