import type {
	IDataObject,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';

import { influencerHeroApiRequest, loadIdNameOptions } from './GenericFunctions';

export class InfluencerHeroTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Influencer Hero Trigger',
		name: 'influencerHeroTrigger',
		icon: { light: 'file:influencerHero.svg', dark: 'file:influencerHero.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when something happens in Influencer Hero',
		defaults: {
			name: 'Influencer Hero Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'influencerHeroApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'product_sent',
				options: [
					{
						name: 'Commission Updated',
						value: 'update_commission',
						description: 'The commission rate of a collaboration changed',
					},
					{
						name: 'Custom Link Updated',
						value: 'update_custom_link',
						description: 'An affiliate link was assigned or changed',
					},
					{
						name: 'Discount Code Updated',
						value: 'update_discount_code',
						description: 'A discount code was assigned or changed',
					},
					{
						name: 'Media KPIs Updated',
						value: 'media_kpi_updated',
						description: 'The views, likes or comments of a tracked post were refreshed',
					},
					{
						name: 'New Email Sent',
						value: 'new_email_sent',
						description: 'An email was sent to an influencer',
					},
					{
						name: 'New Influencer Order',
						value: 'new_influencer_order',
						description: 'An order was attributed to an influencer',
					},
					{
						name: 'New Influencer Post',
						value: 'new_influencer_post',
						description: 'A new post or story of an influencer was detected',
					},
					{
						name: 'New Influencer Reply',
						value: 'new_influencer_reply',
						description: 'An influencer replied to an email',
					},
					{
						name: 'New Max Bid',
						value: 'new_max_bid',
						description: 'An influencer sent their rate',
					},
					{
						name: 'New Payout Request',
						value: 'new_payout_request',
						description: 'A payout was requested',
					},
					{
						name: 'Product Sent',
						value: 'product_sent',
						description: 'A product was sent to an influencer',
					},
				],
			},
			{
				displayName: 'Brand Names or IDs',
				name: 'brandIds',
				type: 'multiOptions',
				typeOptions: { loadOptionsMethod: 'getBrands' },
				default: [],
				description:
					'Only trigger for these brands. Leave empty for all brands. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	};

	methods = {
		loadOptions: {
			async getBrands(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v1/account/search_brands');
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				return (
					webhookData.webhookUrl === this.getNodeWebhookUrl('default') &&
					webhookData.webhookType === this.getNodeParameter('event')
				);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookType = this.getNodeParameter('event') as string;
				const brandIds = this.getNodeParameter('brandIds', []) as Array<string | number>;

				const body: IDataObject = {
					webhook_type: webhookType,
					webhook_url: webhookUrl,
					prevent_duplicate_webhook: true,
				};
				if (brandIds.length) {
					body.brand_ids = brandIds;
				}

				try {
					await influencerHeroApiRequest.call(this, 'POST', '/v1/account/create_webhook', body);
				} catch (error) {
					// 409 means this exact webhook is already registered, which is what we want
					if ((error as { httpCode?: string }).httpCode !== '409') {
						throw new NodeApiError(this.getNode(), error as JsonObject);
					}
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookUrl = webhookUrl;
				webhookData.webhookType = webhookType;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (!webhookData.webhookUrl) {
					return true;
				}

				try {
					await influencerHeroApiRequest.call(this, 'POST', '/v1/account/delete_webhook', {
						webhook_type: webhookData.webhookType,
						webhook_url: webhookData.webhookUrl,
					});
				} catch (error) {
					// 400 "Webhook URL not found" means it is already gone
					if ((error as { httpCode?: string }).httpCode !== '400') {
						return false;
					}
				}

				delete webhookData.webhookUrl;
				delete webhookData.webhookType;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		return {
			workflowData: [this.helpers.returnJsonArray(this.getBodyData())],
		};
	}
}
