import { apiSend } from '$lib/client/apiClient';

export const signOut = async () => {
	await apiSend().authRouter.signOut.POST({});
};

export const signUpEmail = async (
	firstName: string,
	lastName: string,
	email: string,
	password: string
) => {
	const payload = {
		firstName,
		lastName,
		email,
		password
	};
	const response = await apiSend().authRouter.signUpEmail.POST(payload, false);
	return response;
};

export const signInEmail = async (email: string, password: string) => {
	const payload = {
		email,
		password
	};
	await apiSend().authRouter.signInEmail.POST(payload);
	// setUserStore();
};

export const signOnGoogle = async () => {
	// in another window, make a request to /api/authRouter/signOnGoogle

	const loginWindow = window.open(
		'/api/authRouter/signOnGoogle',
		'GoogleLogin',
		'width=500,height=600'
	);

	// Check every 500 milliseconds if the popup has been closed
	const checkLoginWindow = setInterval(function () {
		if (loginWindow && loginWindow.closed) {
			clearInterval(checkLoginWindow);
			// Refresh the parent page
			window.location.reload();
		}
	}, 500);
};
