import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Create a worker instance for the browser. The worker intercepts
// requests on the client side and uses the provided handlers. It
// should only be started in development.
export const worker = setupWorker(...handlers);