import { rest } from 'msw';

// Importing the large menu JSON via require avoids needing
// TypeScript's resolveJsonModule flag on this file.
const menuData = require('../../menu_data.json');

/**
 * List of request handlers for the MSW server. Handlers intercept
 * network requests and return mocked responses. In development this
 * allows the app to function without a real backend. Any requests not
 * handled here will fall through to the real network.
 */
export const handlers = [
  // Mock the menu endpoint. Clients should fetch from `${API_BASE_URL}/menu`.
  rest.get(/\/menu$/, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(menuData));
  }),
];