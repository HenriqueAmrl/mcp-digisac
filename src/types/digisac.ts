export { z } from 'zod';

import { z } from 'zod';

export const EmptyInput = z.object({});

export const PaginationInput = z.object({
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

export const ListContactsInput = z.object({
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

export const SearchContactsInput = z.object({
  query: z.string().min(1).describe('Search by name, phone, or email'),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

export const GetContactInput = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_.-]+$/, 'ID must contain only alphanumeric characters, hyphens, underscores, or dots').describe('Contact ID'),
});

export const ListTicketsInput = z.object({
  isOpen: z.boolean().optional().describe('Filter by open status'),
  userId: z.string().optional().describe('Filter by agent id (from list_agents)'),
  departmentId: z.string().optional().describe('Filter by department id (from list_departments)'),
  contactId: z.string().optional().describe('Filter by contact id'),
  startPeriod: z.string().optional().describe('Filter tickets starting after this ISO date (e.g. 2024-01-01T00:00:00.000Z)'),
  endPeriod: z.string().optional().describe('Filter tickets ending before this ISO date (e.g. 2024-01-31T23:59:59.999Z)'),
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
});

export const GetTicketInput = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_.-]+$/, 'ID must contain only alphanumeric characters, hyphens, underscores, or dots').describe('Ticket ID'),
});

export const GetTicketMessagesInput = z.object({
  ticketId: z.string().regex(/^[a-zA-Z0-9_.-]+$/, 'ID must contain only alphanumeric characters, hyphens, underscores, or dots').describe('Ticket ID to load messages for'),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
