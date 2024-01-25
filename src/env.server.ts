// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { env } from '$env/dynamic/private';

const getEnv = (envKey: string, throwError = false): string => {
	const unTypedVal = env[envKey];
	if (typeof unTypedVal !== 'string') {
		if (throwError) {
			throw new Error(`Env variable ${envKey} is not a string`);
		}
		return '';
	}
	return env[envKey] as string;
};

const e = () => {
	return {
		DATABASE_URL: () => getEnv('DATABASE_URL', true),

		WEBSITE_URL: () => getEnv('WEBSITE_URL', true),

		GOOGLE_ID: () => getEnv('GOOGLE_ID', true),
		GOOGLE_SECRET: () => getEnv('GOOGLE_SECRET', true),

		EMAIL_SERVER_HOST: () => getEnv('EMAIL_SERVER_HOST', true),
		EMAIL_SERVER_PORT: () => getEnv('EMAIL_SERVER_PORT', true),
		EMAIL_SERVER_USER: () => getEnv('EMAIL_SERVER_USER', true),
		EMAIL_SERVER_PASSWORD: () => getEnv('EMAIL_SERVER_PASSWORD', true),
		EMAIL_FROM: () => getEnv('EMAIL_FROM', true)
	};
};

export default e();
