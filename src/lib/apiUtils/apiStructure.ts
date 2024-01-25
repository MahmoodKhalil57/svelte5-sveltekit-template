import { z } from 'zod';

export enum InputTypeEnum {
	TEXT,
	EMAIL,
	TEXTAREA
}

const emailValidation = z
	.string()
	.email()
	.min(7, 'Invalid email')
	.max(50, 'Email is too long')
	.transform((v) => v.toLowerCase());
const shortPasswordValidation = z
	.string()
	.min(1, 'Password is required')
	.min(6, 'Password must be at least 6 characters long')
	.max(16, 'Password must be less than 16 characters long');

const fullPasswordValidation = z
	.string()
	.min(1, 'Password is required')
	.regex(new RegExp('(?=.*[A-Z])'), 'Must contain atleast one capital letter.')
	.regex(new RegExp('(?=.*[a-z])'), 'Must contain atleast one small letter.')
	.regex(new RegExp('(?=.*[0-9])'), 'Must contain atleast one number.')
	.regex(new RegExp('(?=.*[!@#$%^&*])'), 'Must contain atleast one special character.')
	.min(6, 'Password must be at least 6 characters long')
	.max(16, 'Password must be less than 16 characters long');

export const apiStructure = {
	testRouter: {
		testPost: {
			requestType: 'POST',
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		},
		testGet: {
			requestType: 'GET',
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		}
	},
	authRouter: {
		signOut: {
			requestType: 'POST',
			validation: z.object({}) satisfies z.AnyZodObject
		},
		signUpEmail: {
			requestType: 'POST',
			validation: z.object({
				firstName: z
					.string()
					.min(1, 'First name is required')
					.max(20, 'First name is too long')
					.regex(new RegExp('^[\u0621-\u064Aa-zA-Z0-9]*$', 'g'), 'Invalid Characters.'),
				lastName: z
					.string()
					.min(1, 'Last name is required')
					.max(20, 'Last name is too long')
					.regex(new RegExp('^[\u0621-\u064Aa-zA-Z0-9]*$', 'g'), 'Invalid Characters.'),
				email: emailValidation,
				password: fullPasswordValidation
			}) satisfies z.AnyZodObject
		},
		signInEmail: {
			requestType: 'POST',
			validation: z.object({
				email: emailValidation,
				password: shortPasswordValidation
			}) satisfies z.AnyZodObject
		},
		sendResetPasswordEmail: {
			requestType: 'POST',
			validation: z.object({
				email: emailValidation
			}) satisfies z.AnyZodObject,
			formStructure: [
				[{ id: 'email', type: InputTypeEnum.EMAIL, placeHolder: 'Email address', label: 'Email' }]
			]
		},
		resetPasswordEmail: {
			requestType: 'POST',
			validation: z.object({
				code: z.string(),
				password: fullPasswordValidation
			}) satisfies z.AnyZodObject
		},
		signOnGoogle: {
			requestType: 'POST',
			validation: z.object({}) satisfies z.AnyZodObject
		},
		refreshUser: {
			requestType: 'POST',
			validation: z.object({}) satisfies z.AnyZodObject
		}
	},
	callback: {
		email: {
			requestType: 'GET',
			validation: z.object({
				code: z.string()
			}) satisfies z.AnyZodObject
		},
		google: {
			requestType: 'GET',
			validation: z.object({
				code: z.string(),
				state: z.string()
			}) satisfies z.AnyZodObject
		}
	}
} as const;
