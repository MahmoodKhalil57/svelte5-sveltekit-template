import e from '$e';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail', // use 'gmail' as the service
	auth: {
		user: e.EMAIL_SERVER_USER(), // your Gmail account
		pass: e.EMAIL_SERVER_PASSWORD() // your Gmail password
	}
});

export const sendMail = async (
	to: string | string[],
	subject: string,
	text: string,
	html: string
) => {
	await transporter.sendMail({
		from: e.EMAIL_FROM(),
		to,
		subject,
		text,
		html
	});
};

export const sendEmailVerificationEmail = async (to: string, token: string) => {
	try {
		await sendMail(
			to,
			'Verify your account',
			`Your verification passcode is: ${token}, your verification link is: ${e.WEBSITE_URL()}/authRouter/emailCallback?code=${token}`,
			`<b>Your verification passcode is: ${token}</b>
			<br>
			<b>Your verification link is: <a href="${e.WEBSITE_URL()}/authRouter/emailCallback?code=${token}">Click here to verify</a></b>
			<br>
			Or copy and paste this link into your browser:
			<a href="${e.WEBSITE_URL()}/authRouter/emailCallback?code=${token}">${e.WEBSITE_URL()}/authRouter/emailCallback?code=${token}</a>
			`
		);
	} catch (e) {
		console.log(e);
	}
};

export const sendEmailResetPassword = async (to: string, token: string) => {
	await sendMail(
		to,
		'Reset Your password',
		`Your reset-password passcode is: ${token}, your reset-password link is: ${e.WEBSITE_URL()}/forgotPassword/reset?code=${token}`,
		`<b>Your reset-password passcode is: ${token}</b>
		<br>
		<b>Your reset-password link is: <a href="${e.WEBSITE_URL()}/forgotPassword/reset?code=${token}">Click here to reset your password</a></b>
		<br>

		Or copy and paste this link into your browser:
		<a href="${e.WEBSITE_URL()}/forgotPassword/reset?code=${token}">${e.WEBSITE_URL()}/authRouter/resetEmailPassword?code=${token}</a>
		`
	);
};
