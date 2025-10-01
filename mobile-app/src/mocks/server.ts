import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create a server instance for Node environments (e.g. testing). When
// running tests, the server can be started and stopped to intercept
// requests just like the browser worker.
export const server = setupServer(...handlers);