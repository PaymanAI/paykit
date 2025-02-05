# Payman PayKit

The Payman PayKit provides a set of AI-ready tools for integrating Payman's payment functionality into AI models. It's specifically designed to work with the Vercel AI SDK and other AI frameworks that support function calling.

> 🚀 **Quick Start Template**: For a ready-to-use template with this toolkit integrated, check out our [Payman AI SDK Quickstart](https://github.com/PaymanAI/payman-ai-sdk-qs) repository. It includes a complete Next.js setup with the Vercel AI SDK and Payman toolkit pre-configured.

## Installation

```bash
npm install payman-paykit
```

## Prerequisites

You'll need:
- A Payman account with API credentials
- Node.js 16 or higher
- An AI model that supports function calling

## Quick Start

```typescript
import { paykit } from 'payman-paykit';

const { sendPayment, searchDestinations, createPayee, initiateCustomerDeposit, getCustomerBalance, getSpendableBalance } = paykit({
  apiSecret: process.env.PAYMAN_API_SECRET!,
  environment: 'sandbox', // Use 'production' for live payments
});

// Example: Check balance
const balance = await getSpendableBalance({ currency: 'USD' });

// Example: Send payment
const payment = await sendPayment({
  amountDecimal: 50.00,
  paymentDestinationId: 'dest_123',
  memo: 'Payment for services'
});
```

## Available Tools

The toolkit provides the following payment tools that can be used with AI models:

### Payment Operations

- `sendPayment`: Send USD payments to saved destinations
- `initiateCustomerDeposit`: Generate checkout links for deposits
- `createPayee`: Create new payment destinations (ACH/Payman Agent)
- `searchDestinations`: Search existing payment destinations
- `getCustomerBalance`: Check customer's USD balance
- `getSpendableBalance`: Check agent's USD balance

## AI Integration

```typescript
import { generateText } from 'ai';
import { paykit } from 'payman-paykit';

const tools = paykit({
  apiSecret: process.env.PAYMAN_API_SECRET!,
  environment: 'sandbox'
});

const result = await generateText({
  model: 'your-model',
  tools,
  prompt: 'Send a payment of $50 to John'
});
```

For detailed documentation and examples of each tool, visit our [GitHub repository](https://github.com/yourusername/payman-ai-toolkit).

## License

MIT
