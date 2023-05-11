const nodemailer = require('nodemailer');

const adminEmail = 'marinbrnvsk@gmail.com'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: adminEmail,
    pass: 'umflpawmfgvuuawi'
  }
});

const sendEmail = (options) => {
	// console.log('options', options);
	transporter.sendMail({
		...options,
		from: adminEmail
	}, (err, info) => {
		if (err) {
			console.error(err);
		} else {
			console.log('Email sent', info.response);
		}
	})
}

module.exports = { sendEmail }