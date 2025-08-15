const User = require('../models/User'); 

const ispatient = async (req, res, next) => {
    console.log("Checking patient role");
    try {
        // Get user role from database if not in token
        if (!req.user.role) {
            const user = await User.findById(req.user.id);
            req.user.role = user.role;
        }
        
        if (req.user.role === 'patient') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied: only patients allowed"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking role",
            error: error.message
        });
    }
}

const isadmin = async (req, res, next) => {
    console.log("Checking admin role");
    try {
        // Get user role from database if not in token
        if (!req.user.role) {
            const user = await User.findById(req.user.id);
            req.user.role = user.role;
        }
        
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied: only admins allowed"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking role",
            error: error.message
        });
    }
}

module.exports = { ispatient, isadmin };