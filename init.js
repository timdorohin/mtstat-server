'use strict';

//
// My Secure Server
//
//var greenlock = require('greenlock-express')
var greenlock = require('greenlock-express').create({

  // Let's Encrypt v2 is ACME draft 11
  // Note: If at first you don't succeed, stop and switch to staging
  // https://acme-staging-v02.api.letsencrypt.org/directory
  server: 'https://acme-v02.api.letsencrypt.org/directory'
, version: 'draft-11'
  // You MUST have write access to save certs
, configDir: '~/.certs'

// The previous 'simple' example set these values statically,
// but this example uses approveDomains() to set them dynamically
, email: 'tim.dorohin@gmail.com'
, agreeTos: true

  // approveDomains is the right place to check a database for
  // email addresses with domains and agreements and such
, approveDomains: ['mtstat.us.openode.io']

, app: require('./server.js')

  // Get notified of important updates and help me make greenlock better
, communityMember: true

, debug: true

});

var server = greenlock.listen(80, 443);
 
