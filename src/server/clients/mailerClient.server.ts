// import e from '$e';
// import nodemailer from 'nodemailer';

// // import aws, { type SESClientConfig } from '@aws-sdk/client-ses';
// // import { defaultProvider } from '@aws-sdk/credential-provider-node';
// // const ses = new aws.SES({
// // 	apiVersion: '2010-12-01',
// // 	region: 'us-east-2',
// // 	credentialDefaultProvider: defaultProvider
// // });
// // const transporter = nodemailer.createTransport({
// // 	SES: { ses, aws }
// // });

// const transporter = nodemailer.createTransport({
// 	service: 'gmail', // use 'gmail' as the service
// 	auth: {
// 		user: e.EMAIL_SERVER_USER(), // your Gmail account
// 		pass: e.EMAIL_SERVER_PASSWORD() // your Gmail password
// 	}
// });

// export const sendMail = async (
// 	to: string | string[],
// 	subject: string,
// 	text: string,
// 	html: string
// ) => {
// 	await transporter.sendMail({
// 		from: e.EMAIL_FROM(),
// 		to,
// 		subject,
// 		text,
// 		html
// 	});
// };

// export const sendEmailVerificationEmail = async (to: string, token: string) => {
// 	try {
// 		await sendMail(
// 			to,
// 			'Verify your account',
// 			`Your verification link is here.`,
// 			`<b>Your verification link is: <a href="${e.WEBSITE_URL()}/callback/email?code=${token}">Click here to verify</a></b>
// 			<br>
// 			Or copy and paste this link into your browser:
// 			<a href="${e.WEBSITE_URL()}/callback/email?code=${token}">${e.WEBSITE_URL()}/callback/email?code=${token}</a>
// 			`
// 		);
// 	} catch (e) {
// 		console.log(e);
// 	}
// };

// export const sendEmailResetPassword = async (to: string, token: string) => {
// 	await sendMail(
// 		to,
// 		'Reset Your password',
// 		`Your reset password link is here.`,
// 		`<b>Your reset password link is: <a href="${e.WEBSITE_URL()}/forgotPassword/reset?code=${token}">Click here to reset your password</a></b>
// 		<br>

// 		Or copy and paste this link into your browser:
// 		<a href="${e.WEBSITE_URL()}/forgotPassword/reset?code=${token}">${e.WEBSITE_URL()}/callback/resetEmailPassword?code=${token}</a>
// 		`
// 	);
// };
