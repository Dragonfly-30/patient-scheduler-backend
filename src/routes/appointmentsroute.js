const express = require("express");
const router = express.Router();

const { auth } = require('../middlewares/authmiddleware');
const { ispatient, isadmin } = require('../middlewares/rolemiddleware');

console.log("=== APPOINTMENT ROUTES LOADING ===");

// Import controllers with error handling
let createAppointment, getAllAppointments, updateAppointment, deleteAppointment;

try {
  const controllers = require("../controllers/appointmentcontroller");
  ({ createAppointment, getAllAppointments, updateAppointment, deleteAppointment } = controllers);
  console.log("Controllers imported successfully");
  console.log("Controller types:", {
    createAppointment: typeof createAppointment,
    getAllAppointments: typeof getAllAppointments,
    updateAppointment: typeof updateAppointment,
    deleteAppointment: typeof deleteAppointment
  });
} catch (error) {
  console.log(" Controller import failed:", error.message);
}


router.get("/test", (req, res) => {
  console.log("=== TEST ROUTE HIT ===");
  res.json({ 
    success: true,
    message: "Appointment routes are working!",
    timestamp: new Date().toISOString()
  });
});


router.get("/auth-test", auth, (req, res) => {
  console.log("=== AUTH TEST ROUTE HIT ===");
  console.log("User from auth:", req.user);
  res.json({ 
    success: true,
    message: "Authentication working!",
    user: req.user
  });
});

router.post("/portal", auth, ispatient, createAppointment);
router.get("/portal", auth, isadmin, getAllAppointments);
router.put("/portal/:id", auth, isadmin, updateAppointment);
router.delete("/portal/:id", auth, isadmin, deleteAppointment);

// Patient specific routes
router.get("/my-appointments", auth, ispatient, async (req, res) => {
  try {
    const Appointment = require("../models/appointment");
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialization');
    
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
});

console.log("=== ALL ROUTES REGISTERED ===");

module.exports = router;