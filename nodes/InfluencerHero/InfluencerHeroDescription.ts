import type { INodeProperties } from 'n8n-workflow';

export const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Click', value: 'click' },
		{ name: 'Deal', value: 'deal' },
		{ name: 'Influencer', value: 'influencer' },
		{ name: 'Referral', value: 'referral' },
	],
	default: 'deal',
};

export const operationProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['click'] } },
		options: [
			{
				name: 'Register',
				value: 'register',
				description: 'Add link clicks to an influencer collaboration',
				action: 'Register a click',
			},
		],
		default: 'register',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['deal'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Add an influencer to a board as a new deal',
				action: 'Create a deal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Find a deal by its ID or by the influencer handle',
				action: 'Get a deal',
			},
		],
		default: 'create',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['influencer'] } },
		options: [
			{
				name: 'Identify',
				value: 'identify',
				description: 'Check whether customer emails belong to influencers',
				action: 'Identify influencers',
			},
		],
		default: 'identify',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['referral'] } },
		options: [
			{
				name: 'Register',
				value: 'register',
				description: 'Attribute an order to an influencer collaboration',
				action: 'Register a referral',
			},
		],
		default: 'register',
	},
];

const brandOptional: INodeProperties = {
	displayName: 'Brand Name or ID',
	name: 'brand_id',
	type: 'options',
	typeOptions: { loadOptionsMethod: 'getBrands' },
	default: '',
	description:
		'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
};

// Clicks and referrals are booked on a collaboration, which can be found in three ways
const collaborationLookup: INodeProperties[] = [
	{
		displayName: 'Find Collaboration By',
		name: 'lookupBy',
		type: 'options',
		displayOptions: { show: { resource: ['click', 'referral'] } },
		options: [
			{ name: 'Collaboration ID', value: 'collab_id' },
			{ name: 'Deal ID', value: 'deal_id' },
			{ name: 'Influencer Handle', value: 'influencer_handle' },
		],
		default: 'influencer_handle',
	},
	{
		displayName: 'Value',
		name: 'lookupValue',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['click', 'referral'] } },
		description: 'The collaboration ID, deal ID or influencer handle to look up',
	},
];

const clickFields: INodeProperties[] = [
	{
		displayName: 'Clicks to Add',
		name: 'increase_clicks',
		type: 'number',
		typeOptions: { minValue: 1 },
		required: true,
		default: 1,
		displayOptions: { show: { resource: ['click'], operation: ['register'] } },
		description: 'Number of new clicks. Clicks are added on top of the current total, so send only new clicks.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['click'], operation: ['register'] } },
		options: [
			brandOptional,
			{
				displayName: 'Country Code',
				name: 'country_code',
				type: 'string',
				default: '',
				placeholder: 'US',
				description: 'Two-letter country code the clicks came from',
			},
		],
	},
];

const dealFields: INodeProperties[] = [
	{
		displayName: 'Influencer Handle',
		name: 'influencer_handle',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
		description: 'Social media username of the influencer, without the @',
	},
	{
		displayName: 'Board Name or ID',
		name: 'dealflow_id',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getBoards' },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
		description:
			'Board the deal is added to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Create Collaboration',
		name: 'create_collab',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
		description:
			'Whether to also create a collaboration, which is needed to register clicks and referrals',
	},
	{
		...brandOptional,
		required: true,
		displayOptions: {
			show: { resource: ['deal'], operation: ['create'], create_collab: [true] },
		},
		description:
			'Brand the collaboration belongs to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['deal'], operation: ['create'] } },
		options: [
			{ displayName: 'Address Line', name: 'address_line', type: 'string', default: '' },
			{ displayName: 'City', name: 'city', type: 'string', default: '' },
			{
				displayName: 'Commission Percentage',
				name: 'commission_perc',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Country Code',
				name: 'country_code',
				type: 'string',
				default: '',
				placeholder: 'US',
			},
			{ displayName: 'Discount Code', name: 'code', type: 'string', default: '' },
			{
				displayName: 'Discount Percentage',
				name: 'code_perc',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
			},
			{ displayName: 'First Name', name: 'first_name', type: 'string', default: '' },
			{ displayName: 'Last Name', name: 'last_name', type: 'string', default: '' },
			{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
			{ displayName: 'Phone Number', name: 'phone_nr', type: 'string', default: '' },
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'YouTube', value: 'youtube' },
				],
				default: 'instagram',
			},
			{ displayName: 'Postcode', name: 'postcode', type: 'string', default: '' },
			{ displayName: 'Region', name: 'region', type: 'string', default: '' },
		],
	},
	{
		displayName: 'Find Deal By',
		name: 'dealLookupBy',
		type: 'options',
		displayOptions: { show: { resource: ['deal'], operation: ['get'] } },
		options: [
			{ name: 'Deal ID', value: 'deal_id' },
			{ name: 'Influencer Handle', value: 'influencer_handle' },
		],
		default: 'influencer_handle',
	},
	{
		displayName: 'Value',
		name: 'dealLookupValue',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['deal'], operation: ['get'] } },
		description: 'The deal ID (or deal page URL) or the influencer handle to look up',
	},
	{
		displayName: 'Include Collaborations',
		name: 'return_collabs',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['deal'], operation: ['get'] } },
		description: 'Whether to return the collaborations of the deal, with codes, links and sales',
	},
];

const influencerFields: INodeProperties[] = [
	{
		displayName: 'Emails',
		name: 'emails',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'jane@email.com, john@email.com',
		displayOptions: { show: { resource: ['influencer'], operation: ['identify'] } },
		description:
			'Customer emails to check, separated by commas. Matches show up under Your Customers in Influencer Hero.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['influencer'], operation: ['identify'] } },
		options: [
			brandOptional,
			{
				displayName: 'Order ID',
				name: 'order_id',
				type: 'string',
				default: '',
				description: 'Order to link the customers to. Applied to every email in this item.',
			},
		],
	},
];

const referralFields: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'order_id',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['referral'], operation: ['register'] } },
		description:
			'Unique ID of the order in your store. An order ID that was already registered is not counted twice.',
	},
	{
		displayName: 'Order Revenue',
		name: 'order_revenue',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: { show: { resource: ['referral'], operation: ['register'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['referral'], operation: ['register'] } },
		options: [
			brandOptional,
			{
				displayName: 'Commission',
				name: 'order_commission',
				type: 'number',
				default: 0,
				description: 'Commission amount for this order. Left empty, the collaboration rate is used.',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: '',
				placeholder: 'USD',
				description: 'Defaults to the account currency',
			},
			{
				displayName: 'Discount Codes Used',
				name: 'order_discount_codes_used',
				type: 'string',
				default: '',
			},
			{ displayName: 'Order Name', name: 'order_name', type: 'string', default: '' },
			{ displayName: 'Order Notes', name: 'order_notes', type: 'string', default: '' },
			{
				displayName: 'Order Platform',
				name: 'order_platform',
				type: 'string',
				default: 'n8n',
				description: 'Name of the store or system the order came from. Keep it the same for every order of that store.',
			},
			{
				displayName: 'Order Time',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'When the order was placed. Defaults to now.',
			},
		],
	},
];

export const fieldProperties: INodeProperties[] = [
	...collaborationLookup,
	...clickFields,
	...dealFields,
	...influencerFields,
	...referralFields,
];
