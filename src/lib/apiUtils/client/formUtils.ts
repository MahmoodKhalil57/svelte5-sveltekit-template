/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { z } from 'zod';
import toast from 'svelte-french-toast';
import type { ApiClientError } from '$lib/apiUtils/client/apiClientUtils';
import type { apiSend } from '$lib/client/apiClient';

export class EventFormGetter {
	htmlFormElement: HTMLFormElement | null;
	constructor(submitEvent: SubmitEvent) {
		this.htmlFormElement = (submitEvent?.target as unknown as HTMLFormElement | null) ?? null;
	}

	getAllField(elementId: string) {
		return (this.htmlFormElement?.querySelector(`#${elementId}`) as HTMLInputElement) ?? '';
	}

	getStringField(elementId: string) {
		return (this.htmlFormElement?.querySelector(`#${elementId}`) as HTMLInputElement)?.value ?? '';
	}

	getIntField(elementId: string) {
		return parseInt(
			(this.htmlFormElement?.querySelector(`#${elementId}`) as HTMLInputElement)?.value ?? '0',
			10
		);
	}

	getCheckboxField(elementId: string) {
		return (
			(this.htmlFormElement?.querySelector(`#${elementId}`) as HTMLInputElement)?.value ===
				'true' ?? ''
		);
	}
}

export const throwHtmlUiError = (field: HTMLInputElement, message: string) => {
	// field.setCustomValidity(message);
	// field.reportValidity();
};

export const getInlineErrors = (key: string, errorIssues: ApiClientError['errorIssues']) => {
	let errorMessages: string[] | undefined;
	const selectedError = errorIssues.find((val) => val.key === key);
	if (selectedError) {
		errorMessages = selectedError.errorMessages;
	}
	return errorMessages;
};

const promiseToast = (promise: Promise<void>) => {
	return toast.promise(promise, {
		loading: 'Submitting...',
		success: 'Submitted!',
		error: 'Could not submit.'
	});
};

export const sendAndHandle = async <S extends () => ReturnType<typeof apiSend> | any>(
	s: S,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	h: ((response: any) => boolean) | ((response: any) => Promise<boolean>),
	resetOnSuccess = true
) => {
	const response = (await promiseToast(s())) as Awaited<ReturnType<typeof s>>;

	const hasError = !(await h(response));
	if (hasError) {
		throw '';
	} else {
		if (resetOnSuccess) {
			// @ts-expect-error 2339
			submitEvent.target?.reset();
		}
	}
};

export const validateConfirmPassword = (eventObj: EventFormGetter) => {
	const pf = eventObj.getAllField('password');
	const cpf = eventObj.getAllField('confirmPassword');

	if (pf.value !== cpf.value) {
		throwHtmlUiError(cpf, 'Passwords dont match.');
		return [{ key: 'confirmPassword', message: 'Passwords dont match.' }];
	}
	return false;
};

export const ek = (p: string) => {
	return p;
};

export type zodInfer<T extends z.AnyZodObject> = z.infer<T>;

export const promiseToastV2 = async <P extends Promise<unknown>>(promise: P) => {
	let res: Awaited<P> | undefined;
	try {
		// @ts-expect-error 2322
		res = await toast.promise(promise, {
			loading: 'Submitting...',
			success: 'Submitted!',
			error: 'Could not submit.'
		});
	} catch (error) {
		// console.log('error: ', error);
	}

	return res;
};
