const Rollbar = require('rollbar');

exports.logger = new Rollbar({
  accessToken: '751d928dc2dd4ce48b50202b18bd738a',
  captureUncaught: true,
  captureUnhandledRejections: true,
  verbose: false,
  payload: {
    environment: 'production',
  },
});
