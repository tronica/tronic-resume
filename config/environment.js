'use strict';

const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');

const themeFile = path.join(__dirname, '..', 'themes.yml');
const themes    = yaml.safeLoad(fs.readFileSync(themeFile, 'utf8'));

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'tronic-resume',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      THEMES: themes
    },

    DRIVE_API_CLIENT_ID: process.env.DRIVE_API_CLIENT_ID,
    DRIVE_API_KEY: process.env.DRIVE_API_KEY
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
