import type { LogData } from '$apiUtils/server/ApiUtils.type.server';
import type { responseStatus } from '$api/root.server';

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
	info: ({ codeLocation, message, request, requestStatus, response }) => {
		accLoggerData.request = request;
		accLoggerData.response = response;
		accLoggerData.responseStatus = requestStatus;
		if (message) {
			accLoggerData.payloads.push({ location: codeLocation, message, type: 'info' });
		}
	},
	error: ({ codeLocation, message, request, requestStatus, response }) => {
		accLoggerData.request = request;
		accLoggerData.response = response;
		accLoggerData.responseStatus = requestStatus;
		if (message) {
			accLoggerData.payloads.push({ location: codeLocation, message, type: 'error' });
		}
	},
	flush: async () => {
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
