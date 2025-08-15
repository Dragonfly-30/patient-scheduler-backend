const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'santoshi2005anshul@gmail.com',
    pass: 'ulgh fqao kmgt ixho' // App password
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: {
      name: 'Patient Scheduler',
      address: 'anshulsantoshi5@gmail.com'
    },
    to: email,
    subject: 'Verify Your Account - Patient Scheduler',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                padding: 20px;
                color: #ffffff;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
            }
            .logo {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px auto;
                box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
            }
            .title {
                font-size: 28px;
                font-weight: 700;
                background: linear-gradient(135deg, #ffffff 0%, #10b981 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px;
            }
            .subtitle {
                color: rgba(255, 255, 255, 0.7);
                font-size: 16px;
            }
            .otp-section {
                background: rgba(16, 185, 129, 0.1);
                border: 2px solid rgba(16, 185, 129, 0.3);
                border-radius: 16px;
                padding: 24px;
                text-align: center;
                margin: 32px 0;
            }
            .otp-label {
                color: #10b981;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 12px;
            }
            .otp-code {
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #ffffff;
                background: rgba(16, 185, 129, 0.2);
                padding: 16px 32px;
                border-radius: 12px;
                display: inline-block;
                border: 1px solid rgba(16, 185, 129, 0.4);
            }
            .info {
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                line-height: 1.6;
                margin: 24px 0;
            }
            .warning {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
                padding: 16px;
                color: #ef4444;
                font-size: 14px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding-top: 32px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.5);
                font-size: 12px;
            }
            .medical-cross {
                width: 40px;
                height: 40px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    <svg class="medical-cross" viewBox="0 0 40 40" fill="none">
                        <rect x="15" y="5" width="10" height="30" rx="2" fill="white"/>
                        <rect x="5" y="15" width="30" height="10" rx="2" fill="white"/>
                    </svg>
                </div>
                <h1 class="title">Verify Your Account</h1>
                <p class="subtitle">Welcome to Patient Scheduler</p>
            </div>

            <p style="color: rgba(255, 255, 255, 0.8); font-size: 16px; margin-bottom: 24px;">
                Hello <strong style="color: #10b981;">${userName}</strong>,
            </p>
            
            <p class="info">
                Thank you for registering with Patient Scheduler! To complete your account setup and start scheduling appointments, please verify your email address using the OTP code below:
            </p>

            <div class="otp-section">
                <div class="otp-label">YOUR VERIFICATION CODE</div>
                <div class="otp-code">${otp}</div>
            </div>

            <div class="info">
                <strong style="color: #10b981;">Instructions:</strong><br>
                • Enter this 6-digit code on the verification page<br>
                • This code is valid for 10 minutes only<br>
                • Do not share this code with anyone<br>
                • If you didn't request this, please ignore this email
            </div>

            <div class="warning">
                ⚠️ <strong>Security Notice:</strong> This OTP is confidential. Patient Scheduler will never ask for your OTP over phone or email.
            </div>

            <div class="footer">
                <p>© 2024 Patient Scheduler - Healthcare Appointments Made Simple</p>
                <p style="margin-top: 8px;">If you have any questions, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};