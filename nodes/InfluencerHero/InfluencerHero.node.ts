import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	getApiErrorMessage,
	influencerHeroApiRequest,
	loadIdNameOptions,
	removeEmptyValues,
} from './GenericFunctions';
import {
	fieldProperties,
	operationProperties,
	resourceProperty,
} from './InfluencerHeroDescription';

export class InfluencerHero implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Influencer Hero',
		name: 'influencerHero',
		icon: { light: 'file:influencerHero.svg', dark: 'file:influencerHero.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create deals and track influencer clicks and sales in Influencer Hero',
		defaults: {
			name: 'Influencer Hero',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'influencerHeroApi',
				required: true,
			},
		],
		properties: [resourceProperty, ...operationProperties, ...fieldProperties],
	};

	methods = {
		loadOptions: {
			async getBrands(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v1/account/search_brands');
			},
			async getBoards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v1/account/search_dealflows');
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let responseData: IDataObject;

				if (resource === 'deal' && operation === 'create') {
					const createCollab = this.getNodeParameter('create_collab', i) as boolean;
					const body: IDataObject = {
						influencer_handle: this.getNodeParameter('influencer_handle', i) as string,
						platform: this.getNodeParameter('platform', i) as string,
						dealflow_id: this.getNodeParameter('dealflow_id', i) as string,
						create_collab: createCollab,
						...removeEmptyValues(this.getNodeParameter('additionalFields', i) as IDataObject),
					};
					if (createCollab) {
						body.brand_id = this.getNodeParameter('brand_id', i) as string;
					}
					responseData = await influencerHeroApiRequest.call(
						this,
						'POST',
						'/v1/crm/create_deal',
						body,
					);
				} else if (resource === 'deal' && operation === 'get') {
					const lookupBy = this.getNodeParameter('dealLookupBy', i) as string;
					const qs: IDataObject = {
						[lookupBy]: this.getNodeParameter('dealLookupValue', i) as string,
					};
					if (this.getNodeParameter('return_collabs', i) as boolean) {
						qs.return_collabs = 'true';
					}
					const response = await influencerHeroApiRequest.call(
						this,
						'GET',
						'/v1/crm/get_deal_details',
						{},
						qs,
					);
					responseData = (response.deal_info ?? response) as IDataObject;
				} else if (resource === 'influencer' && operation === 'identify') {
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					const emails = (this.getNodeParameter('emails', i) as string)
						.split(',')
						.map((email) => email.trim())
						.filter((email) => email);
					if (!emails.length) {
						throw new NodeOperationError(this.getNode(), 'Add at least one email', {
							itemIndex: i,
						});
					}
					const orderId = additionalFields.order_id as string | undefined;
					const body: IDataObject = removeEmptyValues({
						influencer_list: emails.map((email) =>
							orderId ? { email, order_id: orderId } : { email },
						),
						brand_id: additionalFields.brand_id,
						source_type: 'n8n',
					});
					responseData = await influencerHeroApiRequest.call(
						this,
						'POST',
						'/v1/search/identify_influencers',
						body,
					);
				} else if (resource === 'click' || resource === 'referral') {
					const lookupBy = this.getNodeParameter('lookupBy', i) as string;
					const body: IDataObject = {
						[lookupBy]: this.getNodeParameter('lookupValue', i) as string,
						...removeEmptyValues(this.getNodeParameter('additionalFields', i) as IDataObject),
					};
					if (resource === 'click') {
						body.increase_clicks = this.getNodeParameter('increase_clicks', i) as number;
						responseData = await influencerHeroApiRequest.call(
							this,
							'POST',
							'/v1/crm/new_influencer_click',
							body,
						);
					} else {
						body.order_id = this.getNodeParameter('order_id', i) as string;
						body.order_revenue = this.getNodeParameter('order_revenue', i) as number;
						body.order_platform = body.order_platform || 'n8n';
						responseData = await influencerHeroApiRequest.call(
							this,
							'POST',
							'/v1/crm/new_influencer_referral',
							body,
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				returnData.push({ json: responseData, pairedItem: { item: i } });
			} catch (error) {
				const apiErrorMessage = getApiErrorMessage(error);
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: apiErrorMessage ?? (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
				// the request helper already wrapped the error; re-wrapping keeps the original, so set the message on it
				if (error instanceof NodeApiError) {
					if (apiErrorMessage) error.message = apiErrorMessage;
					throw error;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, {
					itemIndex: i,
					...(apiErrorMessage ? { message: apiErrorMessage } : {}),
				});
			}
		}

		return [returnData];
	}
}
