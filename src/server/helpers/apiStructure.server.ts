import type { ApiStructureStructure } from '$src/lib/utils/apiUtils/server/ApiUtils.type.server';
import { z } from 'zod';
import type { middlewareMap } from '$api/helpers/middleware.server';

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
			middlewares: ['devProcedure'],
			public: true,
			validation: z.object({ name: z.string().min(1) }) satisfies z.AnyZodObject,
			formStructure: [[{ id: 'name', type: 'TEXT', placeHolder: 'Name', label: 'Name' }]] as const
		},
		testGet: {
			requestType: 'GET',
			middlewares: ['devProcedure'],
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		}
	},
	authRouter: {
		signOut: {
			requestType: 'POST',
			middlewares: ['privateProcedure'],
			validation: z.object({}) satisfies z.AnyZodObject
		},
		signUpEmail: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
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
			}) satisfies z.AnyZodObject,
			formStructure: [
				[
					{
						id: 'firstName',
						type: 'TEXT',
						placeHolder: 'First name',
						label: 'First name'
					}
				],
				[
					{
						id: 'lastName',
						type: 'TEXT',
						placeHolder: 'Last name',
						label: 'Last name'
					}
				],
				[{ id: 'email', type: 'EMAIL', placeHolder: 'Email address', label: 'Email' }],
				[
					{
						id: 'password',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'Password'
					},
					{
						id: 'confirmPassword',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'Confirm Password'
					}
				]
			] as const
		},
		signInEmail: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
			validation: z.object({
				email: emailValidation,
				password: shortPasswordValidation
			}) satisfies z.AnyZodObject,
			formStructure: [
				[{ id: 'email', type: 'EMAIL', placeHolder: 'Email address', label: 'Email' }],
				[
					{
						id: 'password',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'Password'
					}
				],
				[{ id: 'forgotPassword', type: 'LINK', text: 'Forgot password?', href: '/forgotPassword' }]
			] as const
		},
		sendResetPasswordEmail: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
			validation: z.object({
				email: emailValidation
			}) satisfies z.AnyZodObject,
			formStructure: [
				[{ id: 'email', type: 'EMAIL', placeHolder: 'Email address', label: 'Email' }]
			] as const
		},
		verifyCode: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
			validation: z.object({
				code: z.string().length(21, 'Invalid code length.')
			}),
			formStructure: [
				[
					{
						id: 'code',
						type: 'EMAIL',
						placeHolder: 'Verification code',
						label: 'Check your email for code.'
					}
				]
			] as const
		},
		resetPasswordEmail: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			validation: z.object({
				code: z.string(),
				password: fullPasswordValidation
			}) satisfies z.AnyZodObject,
			formStructure: [
				[
					{
						id: 'code',
						type: 'TEXT',
						placeHolder: 'Verification code',
						label: 'Check your email for code.'
					},
					{
						id: 'password',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'New password'
					},
					{
						id: 'confirmPassword',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'Confirm password'
					}
				]
			] as const
		},
		signOnGoogle: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			validation: z.object({})
		},
		refreshUser: {
			requestType: 'POST',
			middlewares: ['privateProcedure'],
			validation: z.object({}) satisfies z.AnyZodObject
		}
	},
	callback: {
		email: {
			requestType: 'GET',
			endpointType: 'callback',
			middlewares: ['hybridUserProcedure'],
			validation: z.object({
				code: z.string()
			}) satisfies z.AnyZodObject
		},
		google: {
			requestType: 'GET',
			endpointType: 'callback',
			middlewares: ['hybridUserProcedure'],
			validation: z.object({
				code: z.string(),
				state: z.string()
			})
		}
	}
} satisfies ApiStructureStructure<typeof middlewareMap>;
