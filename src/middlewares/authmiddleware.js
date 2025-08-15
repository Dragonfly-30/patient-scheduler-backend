const jwt = require('jsonwebtoken'); 

const auth = (req, res, next) => {
  console.log("i am inside jwt verification path");
  

  const authHeader = req.headers['authorization']; 

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header not found"
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token not found"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = {auth};
