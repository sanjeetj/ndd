# ndd
### Node Deployment Descriptor
##### ndd tries to solve the problem of isolating source code from deployment specific connection parameters and other static text data.

###Using ndd for deployment auto-wiring
ndd was developed as a helper utility module on top of [nConf](https://github.com/indexzero/nconf). [nConf](https://github.com/indexzero/nconf) is a great module for working with configuration data. 

Do you really need ndd when nConf itself can do everything ndd can? Not really, but we have already put some
though into structuring the configuration file so you can save some dev cycles and brainstorming sessions if you use ndd. 

ndd is very simple to use; it uses a key-value store and a couple of ENV variables to wire your entire application to
connect to the right system components. 

####EXAMPLE

```javascript
    var ndd = require('ndd');
    var redis = require('redis'); //We will use Redis as a sample component
    
    //Load configuration data from current folder
    ndd.load(__dirname+"/conf.json");
    
    //Fetch Redis hostname and port from configuration file and ndd will pick the 
    //correct one for the current environment represented by BUILD_ENV environment var
    //If you are running this in development environment, set BUILD_ENV to dev or
    //if you are running this in production, then set BUILD_ENV to prod when you run the app
    var redisClient = redis.createClient(ndd.getHostname("redis"), ndd.getPort("redis"), {});
    
```
To run this from command prompt, you could either set BUILD_ENV to the right value before hand or you can use something like

```bash
$ BUILD_ENV=prod node App.js
```

This works great with Docker as well. You can set BUILD_ENV inside the docker file as follows

```shell
//Set a Docker argument with a default value of 'dev'
ARG RUNTIME_ENV=dev

//Set the BUILD_ENV variable to the RUNTIME_ENV value
ENV BUILD_ENV $RUNTIME_ENV
```
With this Dockerfile, you can use ```docker build <image> --build-arg RUNTIME_ENV=prod``` while building your Docker container and the container will be created for the right environment.

####Configuration file format
The Deployment configuration data is expected to be categorized by environments.
Environments include dev, qa, prod and others as required.
The configuration file format is expected to be as follows.
>>Note At present ndd only supports hostname, port number, user-id and password. The framework should be extended if any other connection parameter data is required.

```json
      {
        "<env>": {
          "<component-name>": { "host": "<host-name>", "port": "<port-number>", "uid": "<user-id>", "password", "<password>"}
        }
      }
```
Example:

```json
      {
       "prod": {
         "redis": { "host": "prod-host-name", "port": 6379}
       },
       "qa": {
         "redis": { "host": "qa-host-name", "port": 6379}
       },
       "dev": {
         "redis": { "host": "dev-host-name", "port": 6379}
       }
     }
```

###Other useful features
####ndd for multilingual configurable static text support 
ndd can also be used to load static text data in multiple languages. BUILD_LOCALE environment variable can be set to the locale of interest and ndd will pull the static data in the correct language. This can be handy for internationalization use cases.

Such static data should be configured in following format.
```json
 "<type-of-data>": {
  "<locale>": {
          "<id>" : "<static data>",
      }
  }
```
Example: 
```json
  "errors": {
    "en": {
            "400" : "Access Denied!",
            "404" : "Token unavailable/No Query Host"
        }
  }
  
  "labels": {
    "en": {
            "login.screen.id" : "Enter User ID",
            "login.screen.pswd" : "Enter Password"
        }
  }
```
Helper methods are provided to fetch errors and labels. For example

```javascript
ndd.getError("404");
ndd.getLabel("login.screen.id");
```
will return and error "Access Denied!" and a label "Enter User ID" in English if BUILD_LOCALE is set to "en".

####ndd for storing database queries
One last feature supported by ndd is to store database queries. This is really just a wrapper function for better code readability. You can store your database quries grouped by module name and then use ndd helper method ```ndd.getQuery(module,queryId)``` to fetch the query text.

Query data should be stored in following format
```
"db-queries": {
  "<module>": {
          "<query-id>" : "<query>",
      }
  }
```
Example: 
```
  "db-queries": {
    "user-mgmt": {
            "get-all-users" : "select * from USERS"
        }
  }
```

That's all there is to ndd for the moment. Suggestions on enhancing this are welcome.
