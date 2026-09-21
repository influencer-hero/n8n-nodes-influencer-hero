import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InfluencerHeroApi implements ICredentialType {
	name = 'influencerHeroApi';

	displayName = 'Influencer Hero API';

	icon = {
		light: 'file:../nodes/InfluencerHero/influencerHero.svg',
		dark: 'file:../nodes/InfluencerHero/influencerHero.dark.svg',
	} as const;

	documentationUrl = 'https://github.com/influencer-hero/n8n-nodes-influencer-hero#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'n8n Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'In Influencer Hero, open Settings > Integrations > n8n and copy the key shown there',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-INTEGRATION-KEY': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.influencer-hero.com',
			url: '/v1/account/n8n',
			method: 'GET',
		},
	};
}
