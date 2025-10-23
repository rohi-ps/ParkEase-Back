const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendWelcomeEmail = (to, username) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: 'Welcome to ParkEase!',
    text: `Hi ${username},\n\nThanks for registering with ParkEase. We're glad to have you!`
  };

  return transporter.sendMail(mailOptions);
};
