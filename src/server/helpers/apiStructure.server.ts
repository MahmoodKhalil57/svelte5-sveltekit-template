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
			public: true,
			validation: z.object({ name: z.string().min(1) }) satisfies z.AnyZodObject,
			formStructure: [
				[{ id: 'name', type: 'TEXT', placeHolder: 'Name', label: 'Name' }],
				[
					{
						id: 'submitTestPost',
						type: 'SUBMIT'
					}
				]
			] as const
		},
		testGet: {
			requestType: 'GET',
			validation: z.object({ name: z.string() }) satisfies z.AnyZodObject
		}
	},
	authRouter: {
		signOnGoogle: {
			requestType: 'GET',
			middlewares: ['hybridUserProcedure'],
			endpointType: 'callback',
			validation: z.object({})
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
				[
					{
						id: '',
						type: 'TITLE',
						text: 'Login'
					}
				],
				[{ id: 'email', type: 'EMAIL', placeHolder: 'Email address', label: 'Email' }],
				[
					{
						id: 'password',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'Password'
					}
				],
				[
					{
						id: 'forgotPassword',
						type: 'LINK',
						text: 'Forgot password?',
						href: '/forgotPassword',
						Class: 'place-self-end'
					}
				],
				[
					{
						id: 'submitSignInEmail',
						type: 'SUBMIT'
					}
				],
				[
					{
						id: 'forgotPassword',
						type: 'LINK',
						label: 'Dont have an account?',
						text: 'Create one now!',
						href: '/signup',
						ContainerClass: 'gap-2 !flex-row'
					}
				],
				[
					{
						id: '',
						type: 'DIVIDER',
						text: 'OR'
					}
				],
				[
					{
						id: 'googleSignInSignInEmail',
						type: 'GOOGLESIGNIN'
					}
				]
			] as const
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
						id: '',
						text: '1. Sign up',
						type: 'TITLE'
					}
				],
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
				],
				[
					{
						id: 'submitSignUpEmail',
						type: 'SUBMIT'
					}
				],
				[
					{
						id: 'loginLink',
						type: 'LINK',
						label: 'Already have an account?',
						text: 'Login!',
						href: '/login',
						ContainerClass: 'gap-2 !flex-row'
					}
				],
				[
					{
						id: '',
						type: 'DIVIDER',
						text: 'OR'
					}
				],
				[
					{
						id: 'googleSignInSignupEmail',
						type: 'GOOGLESIGNIN'
					}
				]
			] as const
		},
		verifyEmailSignup: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
			validation: z.object({
				code: z.string().length(21, 'Invalid code length.')
			}),
			formStructure: [
				[
					{
						id: '',
						type: 'TITLE',
						text: '2. Verify Account'
					}
				],
				[
					{
						id: 'code',
						type: 'EMAIL',
						placeHolder: 'Verification code',
						label: 'Check your email for code.'
					}
				],
				[
					{
						id: 'submitSendResetPasswordEmail',
						type: 'SUBMIT'
					}
				]
			] as const
		},
		signOut: {
			requestType: 'POST',
			middlewares: ['privateProcedure'],
			validation: z.object({}) satisfies z.AnyZodObject
		},
		sendResetPasswordEmail: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
			validation: z.object({
				email: emailValidation
			}) satisfies z.AnyZodObject,
			formStructure: [
				[
					{
						id: '',
						type: 'TITLE',
						text: '1. Reset Password'
					}
				],
				[{ id: 'email', type: 'EMAIL', placeHolder: 'Email address', label: 'Email' }],
				[
					{
						id: 'submitSendResetPasswordEmail',
						type: 'SUBMIT'
					}
				]
			] as const
		},
		verifyEmailResetPassword: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			public: true,
			validation: z.object({
				code: z.string().length(21, 'Invalid code length.')
			}),
			formStructure: [
				[
					{
						id: '',
						type: 'TITLE',
						text: '2. Verify code'
					}
				],
				[
					{
						id: 'code',
						type: 'EMAIL',
						placeHolder: 'Verification code',
						label: 'Check your email for code.'
					}
				],
				[
					{
						id: 'submitSendResetPasswordEmail',
						type: 'SUBMIT'
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
						id: '',
						type: 'TITLE',
						text: '3. Reset Password'
					}
				],
				[
					{
						id: 'code',
						type: 'TEXT',
						placeHolder: 'Verification code',
						label: 'Check your email for code.',
						Class: 'hidden'
					}
				],
				[
					{
						id: 'password',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'New password'
					}
				],
				[
					{
						id: 'confirmPassword',
						type: 'PASSWORD',
						placeHolder: 'password',
						label: 'Confirm password'
					}
				],
				[
					{
						id: 'submitResetPasswordEmail',
						type: 'SUBMIT'
					}
				]
			] as const
		},
		refreshUser: {
			requestType: 'POST',
			middlewares: ['hybridUserProcedure'],
			validation: z.object({}) satisfies z.AnyZodObject
		},
		emailCallback: {
			requestType: 'GET',
			endpointType: 'callback',
			middlewares: ['hybridUserProcedure'],
			validation: z.object({
				code: z.string()
			}) satisfies z.AnyZodObject
		},
		googleCallback: {
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
