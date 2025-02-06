import { z } from 'zod';
import { tool } from 'ai';
import Paymanai from 'paymanai';

export function paykit(config: {
  apiSecret: string;
  environment?: 'production' | 'sandbox';
}) {
  const client = new Paymanai({
    xPaymanAPISecret: config.apiSecret,
    environment: config.environment || 'sandbox',
  });

  return {
    sendPayment: tool({
      description: 'Send USD from the agent\'s wallet to a pre-created payment destination. Use this when you need to transfer money to a saved bank account or Payman agent. Requires an existing paymentDestinationId.',
      parameters: z.object({
        amountDecimal: z.number().describe('The amount to send in USD (e.g. 10.00 for $10.00)'),
        customerEmail: z.string().optional().describe('Email address of the customer'),
        customerId: z.string().optional().describe('ID of the customer'),
        customerName: z.string().optional().describe('Name of the customer'),
        memo: z.string().optional().describe('Note or memo for the payment'),
        paymentDestinationId: z.string().optional().describe('ID of the pre-created payment destination'),
      }),
      execute: async (params) => {
        const response = await client.payments.sendPayment({
          ...params,
          amountDecimal: params.amountDecimal,
        });
        return response;
      },
    }),

    searchDestinations: tool({
      description: 'Search for existing payment destinations (saved US bank accounts or Payman agents) by name, customer, or email. Use this to find saved payment destinations before sending a payment. Returns a list of matching payment destinations with their IDs.',
      parameters: z.object({
        name: z.string().optional().describe('Name of the payment destination'),
        customerId: z.string().optional().describe('Customer ID who owns the destination'),
        contactEmail: z.string().optional().describe('Contact email to search for'),
      }),
      execute: async (params) => {
        const response = await client.payments.searchDestinations(params);
        return response;
      },
    }),

    createPayee: tool({
      description: 'Create a new payment destination for future USD payments. Use this when you need to save a new US bank account (ACH) or Payman Agent as a payment destination for the first time.',
      parameters: z.discriminatedUnion('type', [
        z.object({
          type: z.literal('US_ACH').describe('US ACH bank transfer'),
          name: z.string().describe('Name for the payment destination'),
          customerId: z.string().describe('Customer ID who owns this destination'),
          accountHolderName: z.string().describe('Name of the account holder'),
          accountHolderType: z.enum(['individual', 'business']).describe('Type of account holder'),
          accountNumber: z.string().describe('Bank account number'),
          routingNumber: z.string().describe('Bank routing number'),
          accountType: z.enum(['checking', 'savings']).describe('Type of bank account'),
          contactDetails: z.object({
            address: z.string().optional().describe('Address of the account holder'),
            email: z.string().optional().describe('Email of the account holder'),
            phoneNumber: z.string().optional().describe('Phone number of the account holder'),
            taxId: z.string().optional().describe('Tax ID of the account holder'),
          }).optional().describe('Optional contact details'),
        }),
        z.object({
          type: z.literal('PAYMAN_AGENT').describe('Payman Agent transfer'),
          name: z.string().describe('Name for the payment destination'),
          paymanAgentId: z.string().describe('The unique ID of the receiving agent'),
          contactDetails: z.object({
            email: z.string().optional().describe('Email of the Payman Agent'),
            phoneNumber: z.string().optional().describe('Phone number of the Payman Agent'),
          }).optional().describe('Optional contact details'),
        }),
      ]),
      execute: async (params) => {
        return await client.payments.createPayee(params);
      },
    }),

    initiateCustomerDeposit: tool({
      description: 'Generate a checkout link that allows a customer to add USD funds to their Payman Wallet using a credit card or bank transfer. Use this when a customer needs to deposit money before making payments. Returns a URL the customer can visit to complete the deposit.',
      parameters: z.object({
        amountDecimal: z.number().describe('The amount to deposit in USD (e.g. 10.00 for $10.00)'),
        customerId: z.string().describe('ID of the customer to deposit funds for'),
        customerEmail: z.string().optional().describe('Email address of the customer'),
        customerName: z.string().optional().describe('Name of the customer'),
        feeMode: z.enum(['INCLUDED_IN_AMOUNT', 'ADD_TO_AMOUNT'])
          .optional()
          .describe('How to handle processing fees - either include in amount or add to amount'),
        memo: z.string().optional().describe('Memo to associate with the transaction'),
        walletId: z.string().optional().describe('ID of specific wallet to deposit to (if agent has multiple wallets)'),
      }),
      execute: async (params) => {
        const response = await client.payments.initiateCustomerDeposit(params);
        return response;
      },
    }),

    getCustomerBalance: tool({
      description: 'Check how much USD a specific customer has available to spend in their Payman Wallet. Use this before initiating payments to verify sufficient funds. Only shows confirmed, spendable balance (excludes pending transactions).',
      parameters: z.object({
        customerId: z.string().describe('ID of the customer to check balance for'),
        currency: z.literal('USD').describe('Currency code (always USD)'),
      }),
      execute: async (params) => {
        const response = await client.balances.getCustomerBalance(
          params.customerId,
          'USD'
        );
        return {
          spendableBalance: response,
          currency: 'USD',
          customerId: params.customerId,
        };
      },
    }),

    getSpendableBalance: tool({
      description: 'Check how much USD the agent (your account) has available to spend in the Payman Wallet. Use this to verify your own available balance before making payments. Only shows confirmed, spendable balance (excludes pending transactions and reserved funds).',
      parameters: z.object({
        currency: z.literal('USD').describe('Currency code (always USD)'),
      }),
      execute: async (params) => {
        const response = await client.balances.getSpendableBalance('USD');
        return {
          spendableBalance: response,
          currency: 'USD',
        };
      },
    }),
  };
} 