import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

export const BASE_URL = 'https://api.influencer-hero.com';

export async function influencerHeroApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	const options: IHttpRequestOptions = {
		method,
		baseURL: BASE_URL,
		url: endpoint,
		qs,
		json: true,
	};
	if (method !== 'GET') {
		options.body = body;
	}
	return await this.helpers.httpRequestWithAuthentication.call(this, 'influencerHeroApi', options);
}

export async function loadIdNameOptions(
	this: ILoadOptionsFunctions,
	endpoint: string,
): Promise<INodePropertyOptions[]> {
	const items = (await influencerHeroApiRequest.call(this, 'GET', endpoint)) as Array<{
		id: string | number;
		name: string;
	}>;
	return items.map((item) => ({ name: item.name, value: item.id }));
}

// Drops empty values so optional fields the user left blank are not sent to the API
export function removeEmptyValues(data: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	for (const [key, value] of Object.entries(data)) {
		if (value === '' || value === undefined || value === null) continue;
		cleaned[key] = value;
	}
	return cleaned;
}

// The API explains failures in `error_message` (e.g. "Deal not found"), which n8n does not pick up on its own
export function getApiErrorMessage(error: unknown): string | undefined {
	const candidate = error as {
		response?: { data?: IDataObject; body?: IDataObject };
		context?: { data?: IDataObject };
		error?: IDataObject;
	};
	const body =
		candidate.response?.data ?? candidate.response?.body ?? candidate.context?.data ?? candidate.error;
	const message = body?.error_message ?? body?.message;
	return typeof message === 'string' && message ? message : undefined;
}
