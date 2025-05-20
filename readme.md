# SGApps Server - very fast NodeJS WebServer

[![pipeline status](https://labs.sgapps.io/open-source/sgapps-server/badges/master/pipeline.svg)](https://labs.sgapps.io/open-source/sgapps-server/-/commits/master)
[![License » Creative Commons Attribution-NonCommercial 4.0 / or Granted by SGApps Labs](https://img.shields.io/badge/License-CC--BY--NC--4.0-crimson)](https://labs.sgapps.io/open-source/sgapps-server/-/blob/master/LICENSE)
[![Repository - GitLab](https://img.shields.io/badge/Repository-GitLab-blue?logo=gitlab)](https://labs.sgapps.io/open-source/sgapps-server/)
[![Documentation](https://img.shields.io/badge/Documentation-Api-blue?logo=html5)](http://open-source.gordienco.net/sgapps-server/)
[![Sergiu Gordienco](https://img.shields.io/badge/author-Sergiu_Gordienco-blue?logo=linkedin)](https://www.linkedin.com/in/sergiu-gordienco/)
[![email sergiu.gordienco@gmail.com](https://img.shields.io/badge/email-sergiu.gordienco@gmail.com-blue?logo=email)](mailto:sergiu.gordienco@gmail.com)

[![npm](https://img.shields.io/npm/v/sgapps-server)](https://www.npmjs.com/package/sgapps-server)
[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/sgappsio/sgapps-server/master)](https://github.com/sgappsio/sgapps-server)
[![GitHub issues](https://img.shields.io/github/issues/sgappsio/sgapps-server)](https://github.com/sgappsio/sgapps-server/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/sgappsio/sgapps-server)](https://github.com/sgappsio/sgapps-server/pulls)

A network solution for web applications.

> Since this application is fully compatible with nodejs-mvc, I decided to replace nodejs-mvc with this new approach.
> SGApps Server is completely new solution, that will be improved continuously thats why I will work on this project instead of nodejs-mvc
>
> by _Sergiu Gordienco &lt; sergiu.gordienco@sgapps.io >_

# Features

-   🚀 Much Faster with common used Interface
-   💻 Pretty Logger Integrated
-   🏗️ AccessLogs ( Combined )
    -   📈 GoAccess Statistics Support ( v1.5.6 )
    -   📈 AWSTats Statistics Support
-   📑 TypeScript Typings ( Intellisense Support )
-   📚 support with MVC Framework

## Authors

-   Gordienco Sergiu &lt; sergiu.gordienco@sgapps.io >

## License

the license is [Apache-2.0](./LICENSE), so one of the requirements is to include reference to this project

## Samples

### Simple Integration ( Similar to ExpressJS )

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (request, response) {
  response.send('hello world')
});

app.server().listen(8080, () => {
  app.logger.log('Server is running on port 8080');
});
```

### Example of Integration with SessionSupport 🍦

```javascript
// ========================================
//   Start your 🚀 Web-Server app Extended
// ========================================

const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (request, response) {
    response.send('hello world session#' + request.session.id);
})

app.whenReady.then(() => {
    app.SessionManager.cookie = 'ssid';
    app.SessionManager.SESSION_LIFE = 120; // seconds

    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

### Example of Integration with AccessLogs for AWStats or GoAccess

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer({
    decorators: [
        require('sgapps-server/decorators/access-logger')
    ]
});

app.AccessLoggerPaths['default'] = {
    isEnabled: true,
    path: configuration.database.filesystem.logs + 'default/{year}/{month}/data-{worker-id}.log'
};

app.whenReady.then(() => {
    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

### Example Advanced of Integration with AccessLogs for AWStats or GoAccess

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer({
    decorators: [
        require('sgapps-server/decorators/access-logger')
    ]
});

app.AccessLoggerPaths['default'] = {
    isEnabled: true,
    // modify the row
    waitAllHandlers: true,
    path: configuration.database.filesystem.logs + 'default/{year}/{month}/data-{worker-id}.log',
    handle: function (data) {
        // used for updating of filtering data
        console.info("LOGGER Data", data);
        return data.match(/\.txt\"/) ? null : data;
    }
};

app.get(/^\/api\//, function () {
    // log all request from api path into separate file
    request.AccessLoggerPaths['api'] = {
        isEnabled: true,
        path: 'api/access.log'
    }
})

app.whenReady.then(() => {
    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

## Full API documentation can be found on [![Documentation](https://img.shields.io/badge/Documentation-Api-blue?logo=html5)](http://open-source.gordienco.net/sgapps-server/)

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [SGAppsServerRequestSession](#sgappsserverrequestsession)
    -   [\_created](#_created)
    -   [\_ip](#_ip)
    -   [\_confirmed](#_confirmed)
    -   [\_id](#_id)
    -   [\_options](#_options)
    -   [data](#data)
    -   [destroy](#destroy)
-   [TemplateManager](#templatemanager)
    -   [\_options](#_options-1)
    -   [\_viewer](#_viewer)
    -   [\_env](#_env)
    -   [templateExists](#templateexists)
    -   [remove](#remove)
    -   [add](#add)
    -   [addList](#addlist)
    -   [get](#get)
    -   [render](#render)
-   [SGAppsServerRequest](#sgappsserverrequest)
    -   [request](#request)
    -   [\_postDataBuffer](#_postdatabuffer)
    -   [getMountUpdatedUrl](#getmountupdatedurl)
    -   [urlInfo](#urlinfo)
    -   [query](#query)
    -   [mountPath](#mountpath)
    -   [body](#body)
    -   [bodyItems](#bodyitems)
    -   [cookies](#cookies)
    -   [MAX_POST_SIZE](#max_post_size)
    -   [files](#files)
    -   [fileItems](#fileitems)
    -   [\_destroy](#_destroy)
    -   [params](#params)
    -   [\_flags](#_flags)
    -   [\_parseDeepFieldName](#_parsedeepfieldname)
    -   [session](#session)
    -   [postData](#postdata)
    -   [RequestParams](#requestparams)
-   [routeMatch](#routematch)
-   [SGAppsServerResponse](#sgappsserverresponse)
    -   [response](#response)
    -   [pipeFile](#pipefile)
    -   [send](#send)
    -   [sendError](#senderror)
    -   [\_destroy](#_destroy-1)
    -   [redirect](#redirect)
    -   [\_flags](#_flags-1)
    -   [pipeFileStaticCallback](#pipefilestaticcallback)
    -   [pipeFileStatic](#pipefilestatic)
    -   [sendStatusCode](#sendstatuscode)
-   [TemplateManagerRenderOptions](#templatemanagerrenderoptions)
-   [TemplateManagerViewer](#templatemanagerviewer)
    -   [\_facebox](#_facebox)
    -   [\_debug](#_debug)
    -   [\_env](#_env-1)
    -   [renderCode](#rendercode)
    -   [render](#render-1)
-   [TemplateManagerTemplate](#templatemanagertemplate)
-   [SGAppsServerEmail](#sgappsserveremail)
    -   [send](#send-1)
    -   [options](#options)
    -   [encodedBody](#encodedbody)
    -   [msg](#msg)
    -   [valid](#valid)
    -   [Config](#config)
    -   [from](#from)
    -   [isValidAddress](#isvalidaddress)
    -   [timeout](#timeout)
    -   [Callback](#callback)
-   [SGAppsSessionManagerOptions](#sgappssessionmanageroptions)
-   [SGAppsServerRequestSessionCache](#sgappsserverrequestsessioncache)
-   [MountUpdatedURL](#mountupdatedurl)
-   [FaceboxTemplate](#faceboxtemplate)
    -   [\_debug](#_debug-1)
    -   [\_env](#_env-2)
    -   [\_cachedFiles](#_cachedfiles)
    -   [INCLUDE_LEVEL](#include_level)
    -   [render](#render-2)
    -   [renderFile](#renderfile)
    -   [renderCode](#rendercode-1)
-   [SGAppsServerRequestCookie](#sgappsserverrequestcookie)
    -   [get](#get-1)
    -   [set](#set)
-   [SGAppsServerDecoratorsLibrary](#sgappsserverdecoratorslibrary)
-   [SGAppsServerErrorCallBack](#sgappsservererrorcallback)
-   [SGAppsServerErrorOnlyCallback](#sgappsservererroronlycallback)
-   [FSLibrary](#fslibrary)
-   [SGAppsServerShared](#sgappsservershared)
-   [SGAppsServerRequestFile](#sgappsserverrequestfile)
-   [SGAppsServerRequestPostDataItem](#sgappsserverrequestpostdataitem)
-   [SGAppsServerDecorator](#sgappsserverdecorator)
-   [SGAppsServer](#sgappsserver)
    -   [CookiesManager](#cookiesmanager)
    -   [\_server](#_server)
    -   [\_decorators](#_decorators)
    -   [TemplateManager](#templatemanager-1)
    -   [\_options](#_options-2)
    -   [STATUS_CODES](#status_codes)
    -   [shared](#shared)
    -   [logger](#logger)
    -   [Email](#email)
    -   [mountPath](#mountpath-1)
    -   [SessionManager](#sessionmanager)
    -   [\_fs](#_fs)
    -   [\_path](#_path)
    -   [EXTENSIONS](#extensions)
    -   [\_requestListeners](#_requestlisteners)
    -   [MAX_POST_SIZE](#max_post_size-1)
    -   [whenReady](#whenready)
    -   [handleRequest](#handlerequest)
    -   [handleErrorRequest](#handleerrorrequest)
    -   [handleStaticRequest](#handlestaticrequest)
    -   [handle](#handle)
    -   [server](#server)
    -   [use](#use)
    -   [post](#post)
    -   [get](#get-2)
    -   [head](#head)
    -   [put](#put)
    -   [trace](#trace)
    -   [delete](#delete)
    -   [options](#options-1)
    -   [connect](#connect)
    -   [patch](#patch)
    -   [all](#all)
    -   [finalHandler](#finalhandler)
    -   [handlePostData](#handlepostdata)
-   [LoggerBuilder](#loggerbuilder)
    -   [\_format](#_format)
    -   [\_debug](#_debug-2)
    -   [\_headerFormatters](#_headerformatters)
    -   [prettyCli](#prettycli)
    -   [log](#log)
    -   [info](#info)
    -   [warn](#warn)
    -   [error](#error)
    -   [prompt](#prompt)
    -   [decorateGlobalLogger](#decorategloballogger)
    -   [headerFormatterInfo](#headerformatterinfo)
    -   [headerFormatter](#headerformatter)
-   [RequestPathStructureMap](#requestpathstructuremap)
-   [SGAppsServerDictionary](#sgappsserverdictionary)
    -   [\_paths](#_paths)
    -   [\_dictionary](#_dictionary)
    -   [generatePathKey](#generatepathkey)
    -   [push](#push)
    -   [run](#run)
-   [RequestPathStructure](#requestpathstructure)
-   [RequestHandler](#requesthandler)
-   [SGAppsServerOptions](#sgappsserveroptions)
-   [SGAppsSessionManager](#sgappssessionmanager)
    -   [\_options](#_options-3)
    -   [\_enabled](#_enabled)
    -   [\_sessions](#_sessions)
    -   [removeExpiredSessions](#removeexpiredsessions)
    -   [handleRequest](#handlerequest-1)
-   [RequestSessionDecorator](#requestsessiondecorator)
-   [SGAppsServerDictionaryRunCallBack](#sgappsserverdictionaryruncallback)
-   [request](#request-1)
-   [request](#request-2)
-   [LoggerBuilderPrompt](#loggerbuilderprompt)
-   [SGAppsServerHandlerPostData](#sgappsserverhandlerpostdata)

### [SGAppsServerRequestSession](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L7)

Type: `function (request, options)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `options` **[SGAppsSessionManagerOptions](#sgappssessionmanageroptions)** 

* * *

#### [\_created](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L25)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

* * *

#### [\_ip](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L33)

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

#### [\_confirmed](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L57)

Session was received from previously saved cookie

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

* * *

#### [\_id](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L64)

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

#### [\_options](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L106)

Type: [SGAppsSessionManagerOptions](#sgappssessionmanageroptions)

* * *

#### [data](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L116)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

* * *

#### [destroy](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L122)

Type: `function ()`

* * *

### [TemplateManager](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L9)

Type: `function (options)`

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options._fs` **[FSLibrary](#fslibrary)** 

* * *

#### [\_options](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L23)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `_fs` **[FSLibrary](#fslibrary)** 

* * *

#### [\_viewer](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L31)

Type: [TemplateManagerViewer](#templatemanagerviewer)

* * *

#### [\_env](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L40)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>

* * *

#### [templateExists](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L64)

Type: `function (templateName): boolean`

-   `templateName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [remove](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L74)

Type: `function (templateName)`

-   `templateName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [add](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L86)

Type: `function (templateName, filePath)`

-   `templateName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [addList](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L98)

Type: `function (templates)`

-   `templates` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>** 

* * *

#### [get](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L114)

Type: `function (templateName): TemplateManagerTemplate`

-   `templateName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [render](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L128)

Type: `function (response, templateName, vars)`

-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `templateName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `vars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>?** 

* * *

### [SGAppsServerRequest](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L9)

Type: `function (request, server)`

-   `request` **IncomingMessage** 
-   `server` **[SGAppsServer](#sgappsserver)** 

* * *

#### [request](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L15)

Type: IncomingMessage

* * *

#### [\_postDataBuffer](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L26)

post data buffer cache

Type: [Buffer](https://nodejs.org/api/buffer.html)

* * *

#### [getMountUpdatedUrl](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-url.js#L26)

Type: `function (url): MountUpdatedURL`

-   `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [urlInfo](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L34)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `original` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `origin` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `domain` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** full domain of url
-   `domain_short` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** domain without "www."
-   `pathname` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** url's pathname
-   `reqQuery` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** url's query from '?'
-   `protocol` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** url.split('://')[0]
-   `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `url_p` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `isIp` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** domain or Ip

* * *

#### [query](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L47)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

* * *

#### [mountPath](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L59)

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

#### [body](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L60)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

* * *

#### [bodyItems](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L72)

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SGAppsServerRequestPostDataItem](#sgappsserverrequestpostdataitem)>

* * *

#### [cookies](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-cookie.js#L79)

Type: [SGAppsServerRequestCookie](#sgappsserverrequestcookie)

* * *

#### [MAX_POST_SIZE](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L83)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

Examples:

```javascript
// changing max post size to 4Mb
request.MAX_POST_SIZE = 4 * 1024 * 1024;
```

```javascript
// reset max post size to global value
request.MAX_POST_SIZE = -1;
```

* * *

#### [files](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L84)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SGAppsServerRequestFile](#sgappsserverrequestfile)>>

* * *

#### [fileItems](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L98)

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SGAppsServerRequestFile](#sgappsserverrequestfile)>

* * *

#### [\_destroy](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L104)

Array of functions to be called on response end

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)>

* * *

#### [params](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L117)

Array of functions to be called on response end

Type: SGAppsServerRequest.RequestParams

* * *

#### [\_flags](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L130)

Array of functions to be called on response end

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `complete` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** The message.complete property will be true if a complete HTTP message has been received and successfully parsed.
-   `aborted` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** The message.aborted property will be true if the request has been aborted.
-   `closed` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Indicates that the underlying connection was closed.
-   `_DEBUG_MAX_HANDLER_EXECUTION_TIME` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** define a bigger request timeout

* * *

#### [\_parseDeepFieldName](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L170)

Automatically used procedure for parsing formData field name if option `server._options._REQUEST_FORM_PARAMS_DEEP_PARSE = true`. it's by default enabled but can be disabled when needed

Type: `function (container, fieldName, fieldData, options)`

-   `container` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `fieldName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `fieldData` **any** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.transform2ArrayOnDuplicate` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)

Examples:

```javascript
paramsContainer = {};
request._parseDeepFieldName(paramsContainer, 'test[arr][data]', 2);
request._parseDeepFieldName(paramsContainer, 'test[arr][]', new Date());
request._parseDeepFieldName(paramsContainer, 'test[arr][]', 2);
request._parseDeepFieldName(paramsContainer, 'test[data]', 2);
// if _debug enabled warns will be emitted
// [Warn] [Request._parseDeepFieldName] Writing Array field "test[arr][]" into a object
// [Warn] [Request._parseDeepFieldName] Overwriting field "test[data]" value
console.log(paramsContainer)
{
    "test": {
        "arr": {
            "1": "2021-02-12T21:23:01.913Z",
            "2": 2,
            "data": 2
        },
        "data": 2
    }
}
```

```javascript
paramsContainer = {};
request._parseDeepFieldName(paramsContainer, 'test[arr][]', new Date());
request._parseDeepFieldName(paramsContainer, 'test[arr][]', 2);
request._parseDeepFieldName(paramsContainer, 'test[arr][data]', 2);
request._parseDeepFieldName(paramsContainer, 'test[data]', 2);
// if _debug enabled warns will be emitted
// [Warn] [Request._parseDeepFieldName] Converting array to object due incorrect field "test[arr][data]" name 
console.log(paramsContainer)
{
    "test": {
        "arr": {
            "0": "2021-02-12T21:34:47.359Z",
            "1": 2,
            "data": 2
        },
        "data": 2
    }
}
```

```javascript
paramsContainer = {};
request._parseDeepFieldName(paramsContainer, 'test[arr][]', new Date());
request._parseDeepFieldName(paramsContainer, 'test[arr][]', 2);
request._parseDeepFieldName(paramsContainer, 'test[data]', 2);
console.log(paramsContainer)
{
    "test": {
        "arr": [
            "2021-02-12T21:26:43.766Z",
            2
        ],
        "data": 2
    }
}
```

* * *

#### [session](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L247)

Type: [SGAppsServerRequestSession](#sgappsserverrequestsession)

* * *

#### [postData](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L358)

request's post received data

Type: [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Buffer](https://nodejs.org/api/buffer.html)>

* * *

#### [RequestParams](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/request.js#L107)

Type: ([Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)> | [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)

* * *

### [routeMatch](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L10)

Type: `function (route, url, strictRouting, _cache)`

-   `route` **[RequestPathStructure](#requestpathstructure)** 
-   `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `strictRouting` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 
-   `_cache` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

* * *

### [SGAppsServerResponse](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/response.js#L10)

Type: `function (response, server)`

-   `response` **ServerResponse** 
-   `server` **[SGAppsServer](#sgappsserver)** 

* * *

#### [response](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/response.js#L17)

Type: ServerResponse

* * *

#### [pipeFile](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-pipe-file.js#L20)

Type: `function (filePath, callback)`

-   `filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `callback` **[SGAppsServerErrorOnlyCallback](#sgappsservererroronlycallback)** represents a `Function(Error)`

* * *

#### [send](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-send.js#L22)

Type: `function (data, options)`

-   `data` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Buffer](https://nodejs.org/api/buffer.html) \| [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;any>)** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.statusCode` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `200`)
    -   `options.headers` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), ([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)>?** 

* * *

#### [sendError](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-error.js#L25)

Type: `function (error, options)`

-   `error` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.statusCode` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `500`)

* * *

#### [\_destroy](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/response.js#L25)

Array of functions to be called on response end

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)>

* * *

#### [redirect](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-redirect.js#L27)

if it returns `false` than the action was not possible

Type: `function (url, options)`

-   `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.statusCode` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `302`)
    -   `options.headers` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), ([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)>?** 

* * *

#### [\_flags](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/response.js#L36)

Array of functions to be called on response end

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `finished` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** will be true if response.end() has been called.
-   `sent` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Is true if all data has been flushed to the underlying system, immediately before the 'finish' event is emitted.
-   `closed` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Indicates that the the response is completed, or its underlying connection was terminated prematurely (before the response completion).

* * *

#### [pipeFileStaticCallback](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-pipe-file-static.js#L19)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `error` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** 

* * *

#### [pipeFileStatic](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-pipe-file-static.js#L37)

Type: `function (filePath, fileName, callback, options)`

-   `filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `fileName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `callback` **SGAppsServerResponse.pipeFileStaticCallback** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.timeout` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `0`)
    -   `options.filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** originap path is autoIndex was applied
    -   `options.autoIndex` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** list of auto-index files, ex: ['index.html', 'index.htm', 'default.html']

* * *

#### [sendStatusCode](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-send.js#L90)

Type: `function (statusCode)`

-   `statusCode` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

* * *

### [TemplateManagerRenderOptions](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L3)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

* * *

### [TemplateManagerViewer](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L13)

Type: `function (options)`

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options._fs` **[FSLibrary](#fslibrary)** 

* * *

#### [\_facebox](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L19)

Type: [FaceboxTemplate](#faceboxtemplate)

* * *

#### [\_debug](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L29)

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

* * *

#### [\_env](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L47)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>

* * *

#### [renderCode](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L70)

Type: `function (code, vars, virtualFilePath, callback)`

-   `code` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `vars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** 
-   `virtualFilePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `callback` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

* * *

#### [render](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/viewer.js#L85)

Type: `function (response, view, vars)`

-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `view` **[TemplateManagerTemplate](#templatemanagertemplate)** 
-   `vars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** 

* * *

### [TemplateManagerTemplate](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L10)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `code` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** 

* * *

### [SGAppsServerEmail](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L44)

Type: `function (config)`

-   `config` **SGAppsServerEmail.Config** optional configuration object

Example:

```javascript
Example:
   var Email = require('path/to/email').Email
   var myMsg = new Email(
   { from: 'me@example.com'
   , to:   'you@example.com'
   , subject: 'Knock knock...'
   , body: "Who's there?"
   })
   myMsg.send(function(err){
     ...
   })
```

* * *

#### [send](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L133)

Send email

Type: `function (callback)`

-   `callback` **SGAppsServerEmail.Callback** 

* * *

#### [options](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L133)

get message options

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `timeout` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

* * *

#### [encodedBody](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L133)

getter generate encoded body

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

#### [msg](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L133)

getter generate all email structure

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

#### [valid](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L133)

check if email is valid

Type: `function (callback)`

-   `callback` **SGAppsServerEmail.Callback** 

* * *

#### [Config](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L1)

Email : Sends email using the sendmail command.

Note: sendmail must be installed: see <http://www.sendmail.org/>

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `to` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)> | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))** Email address(es) to which this msg will be sent
-   `debug` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
-   `from` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Email address from which this msg is sent. If not set defaults to the `exports.from` global setting.
-   `replyTo` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Email address to which replies will be sent. If not
         set defaults to `from`
-   `cc` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)?** Email address(es) who receive a copy
-   `bcc` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>)?** Email address(es) who receive a blind copy
-   `subject` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The subject of the email
-   `body` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The message of the email
-   `bodyType` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Content type of body. Only valid option is
         'html' (for now). Defaults to text/plain.
-   `altText` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** If `bodyType` is set to 'html', this will be sent
         as the alternative text.
-   `timeout` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Duration in milliseconds to wait before killing the
         process. If not set, defaults to `exports.timeout` global setting.
-   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Optional path to the sendmail executable.

* * *

#### [from](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L56)

Email address from which messages are sent. Used
when `from` was not set on a message.

Type: `function (email): string`

-   `email` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [isValidAddress](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L67)

Type: `function (email): boolean`

-   `email` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [timeout](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L80)

Duration in milliseconds to wait before
killing the process. Defaults to 3000. Used when `timeout` is not set
on a message.

Type: `function (milliseconds): number`

-   `milliseconds` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

* * *

#### [Callback](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/email.js#L85)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `err` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** 

* * *

### [SGAppsSessionManagerOptions](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L8)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `SESSION_LIFE` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
-   `cookie` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** 

* * *

### [SGAppsServerRequestSessionCache](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L14)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `expire` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `data` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 

* * *

### [MountUpdatedURL](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-url.js#L17)

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

### [FaceboxTemplate](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L26)

Type: `function (options)`

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options._fs` **[FSLibrary](#fslibrary)** 

* * *

#### [\_debug](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L32)

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

* * *

#### [\_env](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L47)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>

* * *

#### [\_cachedFiles](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L64)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>

* * *

#### [INCLUDE_LEVEL](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L84)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

* * *

#### [render](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L94)

Type: `function (text, vars, env)`

-   `text` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `vars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** 
-   `env` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** 

* * *

#### [renderFile](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L232)

Type: `function (filePath, vars, callback)`

-   `filePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `vars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** 
-   `callback` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

* * *

#### [renderCode](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/template-manager/facebox-templates.js#L255)

Type: `function (code, vars, callback, virtualFilePath)`

-   `code` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `vars` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** 
-   `callback` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 
-   `virtualFilePath` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

### [SGAppsServerRequestCookie](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-cookie.js#L38)

Type: `function ()`

* * *

#### [get](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-cookie.js#L38)

Type: `function (name, options): string`

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.secure` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)

* * *

#### [set](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-cookie.js#L38)

Type: `function (name, value, options, skipErrors): string`

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `value` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.secure` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)
    -   `options.secureProxy` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
    -   `options.signed` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
    -   `options.path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**  (optional, default `"/"`)
    -   `options.expires` **[Date](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)?** 
    -   `options.domain` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** 
    -   `options.httpOnly` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `options.sameSite` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)
    -   `options.secure` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)
    -   `options.overwrite` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)
-   `skipErrors` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)

* * *

### [SGAppsServerDecoratorsLibrary](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L45)

Type: `function ()`

* * *

### [SGAppsServerErrorCallBack](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L22)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `err` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** 
-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `server` **[SGAppsServer](#sgappsserver)** 

* * *

### [SGAppsServerErrorOnlyCallback](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L31)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `err` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** 

* * *

### [FSLibrary](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L45)

Type: `function ()`

* * *

### [SGAppsServerShared](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L45)

Type: `function ()`

* * *

### [SGAppsServerRequestFile](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L28)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `fieldName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** field's name
-   `data` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `data.fileName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** file's name `[duplicate]`
    -   `data.encoding` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** file's encoding
    -   `data.fileStream` **Readable** () => fileStream
    -   `data.fileData` **[Buffer](https://nodejs.org/api/buffer.html)** 
    -   `data.fileSize` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** size in bytes
    -   `data.contentType` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** file's mimeType
    -   `data.loaded` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** indicate if file is fully loaded into `fileData`

* * *

### [SGAppsServerRequestPostDataItem](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-postdata.js#L41)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `fieldName` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** field's name
-   `data` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `data.value` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `data.encoding` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** file's encoding
    -   `data.valTruncated` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `data.fieldNameTruncated` **[Buffer](https://nodejs.org/api/buffer.html)** 
    -   `data.mimeType` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** file's mimeType

* * *

### [SGAppsServerDecorator](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L47)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `server` **[SGAppsServer](#sgappsserver)** 
-   `callback` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

* * *

### [SGAppsServer](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L137)

HTTP Server for high performance results

Type: `function (options)`

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.server` **Server?** 
    -   `options.strictRouting` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `options.debug` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `true`)
    -   `options._DEBUG_MAX_HANDLER_EXECUTION_TIME` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** console shows an warn if handler is executed more than ( works in debug mode ) (optional, default `500`)
    -   `options._DEBUG_REQUEST_HANDLERS_STATS` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** console shows an warn if handler is executed more than ( works in debug mode ) (optional, default `false`)
    -   `options._REQUEST_FORM_PARAMS_DEEP_PARSE` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** parse formData field names to create deep object request.body (optional, default `true`)
    -   `options.decorators` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SGAppsServerDecorator](#sgappsserverdecorator)>?** 

Examples:

```javascript
// ================================
//   Start your 🚀 Web-Server app
// ================================

const { SGAppsServer } = require('@sgapps.io/server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
  res.send('hello world')
})

app.server().listen(8080, () => {
  app.logger.log('Server is running on port 8080');
})
```

```javascript
// ========================================
//   Start your 🚀 Web-Server app Extended
// ========================================

const { SGAppsServer } = require('@sgapps.io/server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
  res.send('hello world')
})

app.whenReady.then(() => {
  app.SessionManager.cookie = 'ssid';
  app.SessionManager.SESSION_LIFE = 120; // seconds

  app.server().listen(8080, () => {
    app.logger.log('Server is running on port 8080');
  })
}, app.logger.error);
```

* * *

#### [CookiesManager](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-cookie.js#L57)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `COOKIES_KEY` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `_enabled` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** if is changed to false server will not decorate requests with cookie manager
-   `handle` **`function (SGAppsServerRequest, SGAppsServerResponse): object`** 

* * *

#### [\_server](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L157)

Type: Server

* * *

#### [\_decorators](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L163)

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[SGAppsServerDecorator](#sgappsserverdecorator)>

* * *

#### [TemplateManager](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/response-template.js#L166)

Type: [TemplateManager](#templatemanager)

* * *

#### [\_options](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L183)

Type: [SGAppsServerOptions](#sgappsserveroptions)

* * *

#### [STATUS_CODES](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L192)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>

* * *

#### [shared](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L199)

Type: [SGAppsServerShared](#sgappsservershared)

* * *

#### [logger](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L206)

Type: [LoggerBuilder](#loggerbuilder)

* * *

#### [Email](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L217)

Type: `function (config): SGAppsServerEmail`

-   `config` **SGAppsServerEmail.Config** 

* * *

#### [mountPath](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L225)

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

* * *

#### [SessionManager](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L227)

Type: [SGAppsSessionManager](#sgappssessionmanager)

* * *

#### [\_fs](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L243)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

* * *

#### [\_path](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L250)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

* * *

#### [EXTENSIONS](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L258)

Type: ResourcesExtensions

* * *

#### [\_requestListeners](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L266)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [SGAppsServerDictionary](#sgappsserverdictionary)>

* * *

#### [MAX_POST_SIZE](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L319)

default value is `16 Kb` » `16 * 1024`

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

* * *

#### [whenReady](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L339)

Type: [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[SGAppsServer](#sgappsserver)>

* * *

#### [handleRequest](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L390)

Type: `function (request, response, callback)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `callback` **[SGAppsServerDictionaryRunCallBack](#sgappsserverdictionaryruncallback)** 

* * *

#### [handleErrorRequest](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L444)

Type: `function (request, response, err)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `err` **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)?** 

* * *

#### [handleStaticRequest](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L461)

Type: `function (request, response, path, callback, options)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `callback` **[SGAppsServerErrorCallBack](#sgappsservererrorcallback)** 
-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**  (optional, default `{timeout:0,autoIndex:[]}`)
    -   `options.timeout` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**  (optional, default `0`)
    -   `options.autoIndex` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>?** list of auto-index files, ex: ['index.html', 'index.htm', 'default.html']

* * *

#### [handle](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L519)

Type: `function (request, response, callback)`

-   `request` **IncomingMessage** 
-   `response` **ServerResponse** 
-   `callback` **[SGAppsServerDictionaryRunCallBack](#sgappsserverdictionaryruncallback)?** 

* * *

#### [server](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L589)

Type: `function (): Server`

* * *

#### [use](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L599)

Type: `function (path, handlers): SGAppsServer`

-   `path` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [RequestHandler](#requesthandler))** 
-   `handlers` **...[RequestHandler](#requesthandler)?** 

* * *

#### [post](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L616)

The `POST` method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [get](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L632)

The `GET` method requests a representation of the specified resource. Requests using GET should only retrieve data.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [head](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L648)

The `HEAD` method asks for a response identical to that of a GET request, but without the response body.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [put](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L664)

The `PUT` method replaces all current representations of the target resource with the request payload.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [trace](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L680)

The `TRACE` method performs a message loop-back test along the path to the target resource.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [delete](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L696)

The `DELETE` method deletes the specified resource.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [options](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L712)

The `OPTIONS` method is used to describe the communication options for the target resource.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [connect](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L728)

The `CONNECT` method establishes a tunnel to the server identified by the target resource.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [patch](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L744)

The `PATCH` method is used to apply partial modifications to a resource.

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [all](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L760)

add handler to all methods

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [finalHandler](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L782)

add final handler to all methods, last added is first

Type: `function (path, handlers): SGAppsServer`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **...[RequestHandler](#requesthandler)** 

* * *

#### [handlePostData](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L806)

Type: `function (options): SGAppsServerHandlerPostData`

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.MAX_POST_SIZE` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
    -   `options.error` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
        -   `options.error.statusCode` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
        -   `options.error.message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** 

* * *

### [LoggerBuilder](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L77)

Pretty CLI Logger, with possibility to replace default nodejs' console logger

Type: `function ()`

Examples:

```javascript
// =============================
//   Use Logger as 💻 instance
// =============================

const { LoggerBuilder } = require('@sgapps.io/server');

const logger = new LoggerBuilder();

logger.log("Hello world");
```

```javascript
// replace default console

const { LoggerBuilder } = require('@sgapps.io/server');
const logger = new LoggerBuilder();
logger.decorateGlobalLogger();

console.log("Console Messages are decorated now");
```

* * *

#### [\_format](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L95)

this parameter may be changed if you decide to change decoration schema

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

Example:

```javascript
// Insert an message in VT100 format
logger._format = "\x1b[7m {{timestamp}} [{{TYPE}}] <{{title}}> {{file}}:{{line}} ({{method}}){{stack}}\x1b[7m";
```

* * *

#### [\_debug](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L101)

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

* * *

#### [\_headerFormatters](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L126)

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;headerFormatter>

* * *

#### [prettyCli](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L158)

Type: `function (ref, indent, separator)`

-   `ref` **any** 
-   `indent` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
-   `separator` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**  (optional, default `"  "`)

* * *

#### [log](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L239)

Type: `function (messages)`

-   `messages` **...any** 

* * *

#### [info](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L254)

Type: `function (messages)`

-   `messages` **...any** 

* * *

#### [warn](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L269)

Type: `function (messages)`

-   `messages` **...any** 

* * *

#### [error](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L284)

Type: `function (messages)`

-   `messages` **...any** 

* * *

#### [prompt](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L318)

Type: `function (callback, message)`

-   `callback` **[LoggerBuilderPrompt](#loggerbuilderprompt)** 
-   `message` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Buffer](https://nodejs.org/api/buffer.html))** 

Example:

```javascript
logger.prompt("rerun tests? [y/n]: ", function (err, buffer) {
	// trim spaces from response
	var response = buffer.toString().replace(/^\s*(.*?)\s*$/, '$1');
	if (response === 'y') {
		// write your code
	}
});
```

* * *

#### [decorateGlobalLogger](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L328)

Type: `function ()`

* * *

#### [headerFormatterInfo](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L103)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `time` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `file` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `line` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `method` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `path` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `stack` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

* * *

#### [headerFormatter](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L115)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `info` **headerFormatterInfo** 

* * *

### [RequestPathStructureMap](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L92)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[RequestHandler](#requesthandler)>** 

* * *

### [SGAppsServerDictionary](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L107)

a dictionary for storing

Type: `function (options)`

-   `options` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?** 
    -   `options.name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)**  (optional, default `""`)
    -   `options.reverse` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**  (optional, default `false`)

* * *

#### [\_paths](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L113)

Type: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[RequestPathStructureMap](#requestpathstructuremap)>

* * *

#### [\_dictionary](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L119)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[RequestHandler](#requesthandler)>>

* * *

#### [generatePathKey](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L135)

Type: `function (path): string`

-   `path` **[RequestPathStructure](#requestpathstructure)** 

* * *

#### [push](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L193)

Type: `function (path, handlers)`

-   `path` **[RequestPathStructure](#requestpathstructure)** 
-   `handlers` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[RequestHandler](#requesthandler)>** 

Example:

```javascript
server.get('/', (req, res) => {
    res.send('root');
})
// will match "test" "best", everything with est
server.get(/.*est/, (req, res) => {
    res.send('root');
})
server.get('/:name/:surname', (req, res) => {
    const { name, surname } = req.params;
    res.send(`Hi ${name} ${surname}`);
})
// apply rules with regexp emulation, they are marked with "^" in the start
server.get('^/:name([a-z]+)/:age(\d+)', (req, res, next) => {
    const { name, age } = req.params;
    if (age < 18) {
        res.send(`Hi ${name}, you are not allowed`);
    } else {
        next()
    }
})
// apply rules with regexp emulation, they are marked with "^" in the start
server.get('^/([a-z]+)/', (req, res, next) => {
    const { name, age } = req.params;
    if (age < 18) {
        res.send(`Hi ${name}, you are not allowed`);
    } else {
        next()
    }
})
// add regular expression with group names
server.get('^/(?<test>[a-z]+)/', (req, res, next) => {
    const { test } = req.params;
    res.send(`param: ${test}`);
})
server.get('/', (req, res) => {
    res.send('root');
})
```

* * *

#### [run](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L245)

Type: `function (request, response, server, callback)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `server` **[SGAppsServer](#sgappsserver)** 
-   `callback` **[SGAppsServerDictionaryRunCallBack](#sgappsserverdictionaryruncallback)** 

* * *

### [RequestPathStructure](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L67)

Type: ([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) \| [RegExp](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp))

* * *

### [RequestHandler](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L71)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `next` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

* * *

### [SGAppsServerOptions](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L78)

Type: [object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

-   `server` **Server?** 
-   `strictRouting` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
-   `_DEBUG_MAX_HANDLER_EXECUTION_TIME` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** 
-   `_DEBUG_REQUEST_HANDLERS_STATS` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** 
-   `_REQUEST_FORM_PARAMS_DEEP_PARSE` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)?** parse formData field names to create deep object request.body

* * *

### [SGAppsSessionManager](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L139)

Type: `function (server, options)`

-   `server` **[SGAppsServer](#sgappsserver)** 
-   `options` **[SGAppsSessionManagerOptions](#sgappssessionmanageroptions)?** 

* * *

#### [\_options](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L145)

Type: [SGAppsSessionManagerOptions](#sgappssessionmanageroptions)

* * *

#### [\_enabled](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L156)

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

* * *

#### [\_sessions](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L163)

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)&lt;[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), [SGAppsServerRequestSessionCache](#sgappsserverrequestsessioncache)>

* * *

#### [removeExpiredSessions](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L172)

Type: `function ()`

* * *

#### [handleRequest](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L188)

Type: `function (request)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 

* * *

### [RequestSessionDecorator](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server/extend/request-session.js#L216)

Type: `function (request, response, server, callback)`

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `server` **[SGAppsServer](#sgappsserver)** 
-   `callback` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

* * *

### [SGAppsServerDictionaryRunCallBack](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/dictionary.js#L230)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `server` **[SGAppsServer](#sgappsserver)** 

* * *

### [request](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L291)

Type: `function (request, response)`

-   `request` **IncomingMessage** 
-   `response` **ServerResponse** 

* * *

### [request](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L308)

Type: `function (request, socket, data)`

-   `request` **IncomingMessage** 
-   `socket` **Duplex** 
-   `data` **[Buffer](https://nodejs.org/api/buffer.html)** 

* * *

### [LoggerBuilderPrompt](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/logger.js#L298)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `message` **[Buffer](https://nodejs.org/api/buffer.html)** 

* * *

### [SGAppsServerHandlerPostData](https://git@labs.sgapps.io/:open-source/sgapps-server/blob/4959fd7e7b3a2a2a6c81ef339439c089f9219b4f/prototypes/server.js#L790)

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

-   `request` **[SGAppsServerRequest](#sgappsserverrequest)** 
-   `response` **[SGAppsServerResponse](#sgappsserverresponse)** 
-   `next` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 

* * *
