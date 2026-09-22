# n8n-nodes-influencer-hero

This is an n8n community node. It lets you use [Influencer Hero](https://www.influencer-hero.com) in your n8n workflows.

Influencer Hero is an influencer marketing platform for influencer search, outreach, CRM, product seeding, content tracking, affiliate sales and payouts.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The package name is `n8n-nodes-influencer-hero`.

## Operations

### Influencer Hero Trigger

Starts a workflow when one of these events happens in your Influencer Hero account. You can limit a trigger to specific brands.

- Commission Updated
- Custom Link Updated
- Discount Code Updated
- Post Statistics Updated
- New Email Sent
- New Influencer Order
- New Influencer Post
- New Influencer Reply
- New Max Bid
- New Payout Request
- Product Sent

### Influencer Hero

| Resource | Operation | What it does |
| --- | --- | --- |
| Deal | Create | Adds an influencer (handle + platform) to a board as a new deal, optionally with a collaboration |
| Deal | Get | Finds a deal by deal ID or influencer handle |
| Referral | Register | Attributes an order to an influencer collaboration |
| Click | Register | Adds link clicks to an influencer collaboration |
| Influencer | Identify | Checks whether customer emails belong to influencers |

## Credentials

1. In Influencer Hero, open **Settings > Integrations** and select **n8n**.
2. Click **Generate key** and copy the key.
3. In n8n, create an **Influencer Hero API** credential and paste the key.

The key is available on every Influencer Hero plan. It only works for the operations of this node. You can replace it at any time with **Regenerate key**, which stops the old key from working.

## Compatibility

Built with the n8n community node tooling (`n8nNodesApiVersion` 1).

## Usage

- **Register a click** adds clicks on top of the current total. Send only new clicks, not a running total.
- **Register a referral** ignores an order ID that was already registered for the same order platform, so retries are safe. Keep **Order Platform** the same for every order of a store.
- Clicks and referrals need a collaboration. Create the deal with **Create Collaboration** switched on, or create the collaboration in Influencer Hero first.
- The trigger needs an n8n instance with a public webhook URL. Influencer Hero rejects `localhost` and private addresses, so set `WEBHOOK_URL` (or use a tunnel) when you run n8n locally.
- Most requests are limited per minute and per account. When the limit is hit the API answers with status 429 and a `Retry-After` header.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Influencer Hero API documentation](https://docs.influencer-hero.com)
