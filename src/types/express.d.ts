import { AuthPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      validatedData?: any;
      validatedQuery?: any;
    }
  }
}

export {};