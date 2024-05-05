import type { LogData } from '$apiUtils/server/ApiUtils.type.server';
import type { responseStatus } from '$api/root.server';
import { dev } from '$app/environment';

const LOGDATA = !dev;

let accLoggerData: {
	request?: Request;
	response?: Response;
	responseStatus?: responseStatus;
	identifier?: string;
	payloads: {
		type: 'info' | 'error';
		location: string;
		message: string;
	}[];
} = {
	payloads: []
};
export const logData = {
	clear: () => {
		accLoggerData = {
			payloads: []
		};
	},
	info: ({ codeLocation, message, request, requestStatus, response, identifier }) => {
		if (request) {
			accLoggerData.request = request;
		}

		if (response) {
			accLoggerData.response = response;
		}

		if (requestStatus) {
			accLoggerData.responseStatus = requestStatus;
		}

		if (identifier) {
			accLoggerData.identifier = identifier;
		}
		if (message) {
			accLoggerData.payloads.push({ location: codeLocation, message, type: 'info' });
		}
	},
	error: ({ codeLocation, message, request, requestStatus, response, identifier }) => {
		if (request) {
			accLoggerData.request = request;
		}

		if (response) {
			accLoggerData.response = response;
		}

		if (requestStatus) {
			accLoggerData.responseStatus = requestStatus;
		}

		if (identifier) {
			accLoggerData.identifier = identifier;
		}
		if (message) {
			accLoggerData.payloads.push({ location: codeLocation, message, type: 'error' });
		}
	},
	flush: async () => {
		if (!LOGDATA) return;
		if (accLoggerData.payloads.length === 0) {
			console.log({
				request: accLoggerData.request,
				response: accLoggerData.response,
				responseStatus: accLoggerData.responseStatus,
				identifier: accLoggerData.identifier
			});
		} else {
			accLoggerData.payloads.forEach((payload) => {
				if (payload.type === 'error') {
					console.error({
						request: accLoggerData.request,
						response: accLoggerData.response,
						responseStatus: accLoggerData.responseStatus,
						identifier: accLoggerData.identifier,
						location: payload.location,
						message: payload.message
					});
				} else if (payload.type === 'info') {
					console.info({
						request: accLoggerData.request,
						response: accLoggerData.response,
						responseStatus: accLoggerData.responseStatus,
						identifier: accLoggerData.identifier,
						location: payload.location,
						message: payload.message
					});
				}
			});
		}
	}
} satisfies LogData;
