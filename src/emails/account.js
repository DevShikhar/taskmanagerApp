const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.API_KEY_SGMAIL);
const msg = {
	to: "shikhar1481997@gmail.com",
	from: "shikhar1481997@gmail.com",
	subject: "Testing sgMail 2",
	text: "This is Task manager app in development test 2.",
	html: "<h2><strong>Task Manager App</strong></h2>",
};

const sendWelcomeEmail = (email, username) => {
	sgMail.send({
		to: email,
		from: "shikhar1481997@gmail.com",
		subject: "Task MAnager Registration",
		text: `Hi ${username},\nWelcome to Task Manger App 🙌🙌`,
	});
};

const sendCancleEmail = (email, username) => {
	sgMail.send({
		to: email,
		from: "shikhar1481997@gmail.com",
		subject: "Task MAnager Cancelation",
		text: `Hi ${username},\nHope you enjoyed using Our application. Do let us know your feedback by replying to this mail`,
	});
};

module.exports = { sendWelcomeEmail, sendCancleEmail };
