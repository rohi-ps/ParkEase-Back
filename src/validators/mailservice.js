const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendWelcomeEmail = async (to, username) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to:"vuddangidurgaprasad@gmail.com",
    subject: 'Welcome to ParkEase!',
    text: `Hi ${username},\n\nThanks for registering with ParkEase. We're glad to have you!`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    return info;
  } catch (err) {
    console.error('sendMail failed:', JSON.stringify(err, null, 2));
    throw err;
  }
};


