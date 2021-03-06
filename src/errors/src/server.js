import BaseError from './base';

export default class ServerError extends BaseError {
  constructor(message = 'An error occurred on the server.', debug, code = 500, kinveyRequestId) {
    super('ServerError', message, debug, code, kinveyRequestId);
  }
}
