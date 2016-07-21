var fs = require('fs');
var nconf = require('nconf');

var env = "local"; //Default env is local
var locale = "en_US"; //Default locale is English United States
var errors;
var labels;
var queries;

/**
 * Loads Deployment configuration values and makes them available for use.
 * Two environment variables named BUILD_ENV and BUILD_LOCALE are required to be defined 
 * 
 * For example, BUILD_ENV can be set to "prod", "dev" etc.
 * and BUILD_LOCALE can be set to "us_EN", "cs_CZ" etc.
 *
 * BUILD_ENV is used to dynamically choose desired deployment configuration at runtime.
 * BUILD_LOCALE is used to dynamically choose language specific static data at runtime.
 *
 * 
 * Runtime Connection Parameter Data:
 * 
 * The Deployment configuration data is expected to be categorized by environments.
 * Environments include dev, qa, prod and others as required.
 * The configuration file format is expected to be as follows.
 * At present the framework only supports hostname, port number, user-id and password. The framework should 
 * be extended if any other connection parameter data is required.
 * 
 *      {
 *        "<env>": {
 *          "<component-name>": { "host": "<host-name>", "port": <port-number>, "uid": <user-id>, "password", "<password>"}
 *        }
 *      }
 *
 *  Example:
 *
 *      {
 *       "prod": {
 *         "redis": { "host": "prod-host-name", "port": 6379}
 *       },
 *       "qa": {
 *         "redis": { "host": "qa-host-name", "port": 6379}
 *       },
 *       "dev": {
 *         "redis": { "host": "dev-host-name", "port": 6379}
 *       }
 *     }
 *
 * Static String Data (Error messages, labels etc.):
 * 
 * ndd can also load locale specific static string data to support i18n. Such static data should be 
 * configured in following format.
 * 
 * "<type-of-data>": {
 *  "<locale>": {
 *          "<id>" : "<static data>",
 *      }
 *  }
 *
 * Example: 
 * 
 *  "errors": {
 *    "en": {
 *            "400" : "Access Denied!",
 *            "404" : "Token unavailable/No Query Host"
 *        }
 *  },
 * 
 * "labels": {
 *    "en": {
 *            "login.screen.id" : "Enter User ID",
 *            "login.screen.pswd" : "Enter Password"
 *        }
 *  }
 *  
 * Database Queries:
 * 
 * ndd can also be used to configure database queries in the following manner. Queries should be
 * grouped by module name
 * 
 * "db-queries": {
 *  "<module>": {
 *          "<query-id>" : "<query>",
 *      }
 *  }
 *
 * Example: 
 * 
 *  "db-queries": {
 *    "user-mgmt": {
 *            "get-all-users" : "select * from USERS"
 *        }
 *  }
 * 
 * 
 * @param  {String} filename
 * 
 */
exports.load = function(fileName) {

  //Read configuration key value pairs from command line, environment vars and the specified file
  //It is assumed that this file contains connection parameters for all external components.
  nconf.argv().env().file('options', fileName);

  //The module assumes that BUILD_ENV environment var is set to the environment in which this Node App 
  //will be run. It then uses BUILD_ENV value to fetch environment specific connection parameters.
  env = nconf.get('BUILD_ENV');

  //If the environment is not set, assume it's a local development environment
  if(env == null || env == '') {
    console.log('BUILD_ENV not defined. Setting build environment to local');
    env = 'local';
  }

  //The module assumes that BUILD_LOCALE environment var contains the Locale in which the App is running.
  //If a Locale is not defined, it assumes English (en) as default
  locale = nconf.get('BUILD_LOCALE');

  if(locale == null || locale == '') {
    console.log('BUILD_LOCALE not defined. Setting build locale to en_US');
    locale = 'en_US';
  }
  
  errors = nconf.get("errors:"+locale);
  labels = nconf.get("labels:"+locale);

  
};

/*
 * A utility method to fetch hostname of a given component from the config file
 *
 * @param component Component represents any external system such as Redis, Mongo, Cassandra etc.
 * @returns Hostname configured for the current environment. Returns undefined if the key is not found.
 */
exports.getHostname=function(component) {
  return nconf.get(env+':'+component+':host');
}

/*
 * A utility method to fetch port number of a given component from the config file
 *
 * @param component Component represents any external system such as Redis, Mongo, Cassandra etc.
 * @returns Port number configured for the current environment. Returns undefined if the key is not found.
 */
exports.getPort=function(component) {
  return nconf.get(env+':'+component+':port');
}

/*
 * A utility method to fetch any value from the config file
 *
 * @param key Any key value
 * @returns corresponding value for the given key. Returns undefined if the key is not found.
 */
exports.getAnyValue=function(key) {
  return nconf.get(key);
}

/*
 * Returns the runtime environment set by user
 *
 * @returns runtime environment
 */
exports.getEnvironment=function() {
  return env;
}

/*
 * Returns the runtime locale set by user
 *
 * @returns runtime locale
 */
exports.getLocale=function() {
  return locale;
}

/*
 * Returns the entire error object for the current locale
 *
 * @returns erros object
 */
exports.getErrors=function() {
  return errors;
}

/*
 * Returns the error text for the given error-code
 * Returns undefined if key is not present.
 *
 * @param error-code
 * @returns error text
 */
exports.getError=function(errCode) {
  return nconf.get('errors:'+locale+':'+errCode);
}

/*
 * Returns the entire labels object for the current locale.
 * Returns undefined if key is not present.
 *
 * @returns labels object
 */
exports.getLabels=function() {
  return labels;
}

/*
 * Returns the error text for the given error-code. Returns undefined if key is not present.
 *
 * @param error-code
 * @returns error text
 */
exports.getLabel=function(labelCode) {
  return nconf.get('labels:'+locale+':'+labelCode);
}

/*
 * Returns the query text for the given module and query id
 * If the module or the query id is not defined, it returns undefined
 *
 * @param module Name of the module
 * @param queryId Query ID
 * @returns error text
 */
exports.getQuery=function(module, queryId) {
  return nconf.get('db-queries:'+module+':'+queryId);
}
