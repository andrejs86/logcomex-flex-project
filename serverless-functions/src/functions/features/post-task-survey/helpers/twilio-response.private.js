class TwilioHelper {
  constructor(logger) {
    this.logger = logger;
  }

  defaultResponse() {
    return this._defaultResponse();
  }

  badRequestResponse(message) {
    const response = this._defaultResponse();
    response.setStatusCode(400);
    response.setBody(message);
    return response;
  }

  forbiddenResponse() {
    const response = this._defaultResponse();
    response.setStatusCode(403);
    return response;
  }

  genericErrorResponse(message) {
    const response = this._defaultResponse();
    response.setStatusCode(500);
    response.setBody(message);
    return response;
  }

  _defaultResponse() {
    const response = new Twilio.Response();
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');
    return response;
  }
}

/** @module twilioHelper */
module.exports = {
  TwilioHelper,
};
