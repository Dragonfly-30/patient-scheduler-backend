const Appointment = require("../models/appointment");

const createAppointment = async (req, res) => {
  try {
    console.log("=== CREATE APPOINTMENT ===");
    console.log("User from token:", req.user);
    console.log("Request body:", req.body);

    const patientId = req.user.id; // req.user._id ki jagah req.user.id use karo
    const { date, time, status, doctorId, reason } = req.body;

    const newAppointment = new Appointment({
      patient: patientId,
      doctor: doctorId && doctorId.trim() !== '' ? doctorId : undefined,
      date,
      time,
      reason,
      status: status || 'pending'
    });

    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: newAppointment
    });
  } catch (error) {
    console.log("Error in createAppointment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating appointment",
      error: error.message
    });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    console.log("=== GET ALL APPOINTMENTS ===");
    console.log("Admin user:", req.user);

    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.log("Error in getAllAppointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
};

const updateAppointment = async (req, res) => {
  try {
    console.log("=== UPDATE APPOINTMENT ===");
    console.log("Appointment ID:", req.params.id);
    console.log("Updates:", req.body);

    const appointmentId = req.params.id;
    const updates = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId, 
      updates, 
      { new: true, runValidators: true }
    ).populate('patient', 'name email');

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.log("Error in updateAppointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
      error: error.message
    });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    console.log("=== DELETE APPOINTMENT ===");
    console.log("Appointment ID:", req.params.id);

    const appointmentId = req.params.id;
    const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    console.log("Error in deleteAppointment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment
};