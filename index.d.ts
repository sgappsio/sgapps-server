
declare module "sgapps-server" {

// import * as FSLibraryModule from 'fs';

// export = FSLibraryModule;

interface ReadableStream extends EventEmitter {
    readable: boolean;
    read(size?: number): string | Buffer;
    setEncoding(encoding: BufferEncoding): this;
    pause(): this;
    resume(): this;
    isPaused(): boolean;
    pipe<T extends WritableStream>(destination: T, options?: { end?: boolean; }): T;
    unpipe(destination?: WritableStream): this;
    unshift(chunk: string | Uint8Array, encoding?: BufferEncoding): void;
    wrap(oldStream: ReadableStream): this;
    [Symbol.asyncIterator](): AsyncIterableIterator<string | Buffer>;
}

interface WritableStream extends EventEmitter {
    writable: boolean;
    write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean;
    write(str: string, encoding?: BufferEncoding, cb?: (err?: Error | null) => void): boolean;
    end(cb?: () => void): void;
    end(data: string | Uint8Array, cb?: () => void): void;
    end(str: string, encoding?: BufferEncoding, cb?: () => void): void;
}declare namespace SGAppsServer {
    namespace NodeJsMvc {
        namespace Controller {
            type View = {
                name: string;
                path: string;
                code: string;
            };
            type View = {
                name: string;
                path: string;
                code: string;
            };
            namespace Action {
                type OptionCapture = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, controller: SGAppsServer.NodeJsMvc.Controller, action: SGAppsServer.NodeJsMvc.Controller.Action) => void;
                type Options = {
                    public: boolean;
                    postData: boolean;
                    maxPostSize: number;
                    capture?: SGAppsServer.NodeJsMvc.Controller.Action.OptionCapture;
                };
            }
            class Action {
                constructor(actionName: string, controller: SGAppsServer.NodeJsMvc.Controller, options: SGAppsServer.NodeJsMvc.Controller.Action.Options, server: SGAppsServer);
                controller: SGAppsServer.NodeJsMvc.Controller;
                name: string;
                run(request: SGAppsServerRequest, response: SGAppsServerResponse): void;
                public: boolean;
                postData: boolean;
                maxPostSize: number;
            }
        }
        class Controller {
            constructor(controllerName: string, options: {
                shared?: any;
            }, server: SGAppsServer);
            _actions: {
                [key: string]: SGAppsServer.NodeJsMvc.Controller.Action;
            };
            _views: {
                [key: string]: SGAppsServer.NodeJsMvc.Controller.View;
            };
            viewer: TemplateManagerViewer;
            name: string;
            getView(viewName: string): SGAppsServer.NodeJsMvc.Controller.View;
            viewExists(viewName: string): boolean;
            addView(view: SGAppsServer.NodeJsMvc.Controller.View): SGAppsServer.NodeJsMvc.Controller.View;
            render(response: SGAppsServerResponse, viewName: string, options?: any): void;
            removeView(viewName: string): boolean;
            getAction(actionName: string): SGAppsServer.NodeJsMvc.Controller.Action;
            actionExists(actionName: string): boolean;
            addAction(actionName: string, options: any): boolean;
            removeAction(actionName: string): boolean;
            shared: {
                [key: string]: any;
            };
        }
    }
    class NodeJsMvc {
        appPath: string;
        controllers: {
            [key: string]: SGAppsServer.NodeJsMvc.Controller;
        };
        whenReady: Promise<{
            [key: string]: SGAppsServer.NodeJsMvc.Controller;
        }>;
    }
}

declare function routeMatch(route: RequestPathStructure, url: string, strictRouting: boolean, _cache: any): void;

declare type RequestPathStructureMap = {
    key: string;
    path: RequestPathStructure;
    handlers: RequestHandler[];
};

/**
 * <p>a dictionary for storing</p>
 */
declare class SGAppsServerDictionary {
    constructor(options?: {
        name?: string;
        reverse?: boolean;
    });
    _paths: RequestPathStructureMap[];
    _dictionary: {
        [key: string]: RequestHandler[];
    };
    generatePathKey(path: RequestPathStructure): string;
    /**
     * @example
     * server.get('/', (req, res) => {
     *     res.send('root');
     * })
     * // will match "test" "best", everything with est
     * server.get(/.*est/, (req, res) => {
     *     res.send('root');
     * })
     * server.get('/:name/:surname', (req, res) => {
     *     const { name, surname } = req.params;
     *     res.send(`Hi ${name} ${surname}`);
     * })
     * // apply rules with regexp emulation, they are marked with "^" in the start
     * server.get('^/:name([a-z]+)/:age(\d+)', (req, res, next) => {
     *     const { name, age } = req.params;
     *     if (age < 18) {
     *         res.send(`Hi ${name}, you are not allowed`);
     *     } else {
     *         next()
     *     }
     * })
     * // apply rules with regexp emulation, they are marked with "^" in the start
     * server.get('^/([a-z]+)/', (req, res, next) => {
     *     const { name, age } = req.params;
     *     if (age < 18) {
     *         res.send(`Hi ${name}, you are not allowed`);
     *     } else {
     *         next()
     *     }
     * })
     * // add regular expression with group names
     * server.get('^/(?<test>[a-z]+)/', (req, res, next) => {
     *     const { test } = req.params;
     *     res.send(`param: ${test}`);
     * })
     * server.get('/', (req, res) => {
     *     res.send('root');
     * })
     */
    push(path: RequestPathStructure, handlers: RequestHandler[]): void;
    run(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: SGAppsServerDictionaryRunCallBack): void;
}

declare type SGAppsServerDictionaryRunCallBack = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

declare namespace SGAppsServerEmail {
    /**
     * <p>Email : Sends email using the sendmail command.</p>
     * <p>Note: sendmail must be installed: see http://www.sendmail.org/</p>
     * @property to - <p>Email address(es) to which this msg will be sent</p>
     * @property [from] - <p>Email address from which this msg is sent. If not set defaults to the <code>exports.from</code> global setting.</p>
     * @property [replyTo] - <p>Email address to which replies will be sent. If not
     * set defaults to <code>from</code></p>
     * @property [cc] - <p>Email address(es) who receive a copy</p>
     * @property [bcc] - <p>Email address(es) who receive a blind copy</p>
     * @property subject - <p>The subject of the email</p>
     * @property body - <p>The message of the email</p>
     * @property [bodyType] - <p>Content type of body. Only valid option is
     * 'html' (for now). Defaults to text/plain.</p>
     * @property [altText] - <p>If <code>bodyType</code> is set to 'html', this will be sent
     * as the alternative text.</p>
     * @property [timeout] - <p>Duration in milliseconds to wait before killing the
     * process. If not set, defaults to <code>exports.timeout</code> global setting.</p>
     * @property [path] - <p>Optional path to the sendmail executable.</p>
     */
    type Config = {
        to: string[] | string;
        debug?: boolean;
        from?: string;
        replyTo?: string;
        cc?: string | string[];
        bcc?: string | string[];
        subject: string;
        body: string;
        bodyType?: string;
        altText?: string;
        timeout?: number;
        path?: string;
    };
    type Callback = (err: Error) => void;
}

/**
 * @example
 * Example:
 *    var Email = require('path/to/email').Email
 *    var myMsg = new Email(
 *    { from: 'me@example.com'
 *    , to:   'you@example.com'
 *    , subject: 'Knock knock...'
 *    , body: "Who's there?"
 *    })
 *    myMsg.send(function(err){
 *      ...
 *    })
 * @param config - <p>optional configuration object</p>
 */
declare class SGAppsServerEmail {
    constructor(config: SGAppsServerEmail.Config);
    /**
     * <p>Email address from which messages are sent. Used
     * when <code>from</code> was not set on a message.</p>
     */
    static from(email: string): string;
    static isValidAddress(email: string): boolean;
    /**
     * <p>Duration in milliseconds to wait before
     * killing the process. Defaults to 3000. Used when <code>timeout</code> is not set
     * on a message.</p>
     */
    static timeout(milliseconds: number): number;
    /**
     * <p>Send email</p>
     */
    send(callback: SGAppsServerEmail.Callback): void;
    /**
     * <p>get message options</p>
     */
    readonly options: {
        timeout: number;
    };
    /**
     * <p>getter generate encoded body</p>
     */
    readonly encodedBody: string;
    /**
     * <p>getter generate all email structure</p>
     */
    readonly msg: string;
    /**
     * <p>check if email is valid</p>
     */
    valid(callback: SGAppsServerEmail.Callback): void;
}

/**
 * <p>Pretty CLI Logger, with possibility to replace default nodejs' console logger</p>
 * @example
 * // =============================
 * //   Use Logger as 💻 instance
 * // =============================
 *
 * const { LoggerBuilder } = require('@sgapps.io/server');
 *
 * const logger = new LoggerBuilder();
 *
 * logger.log("Hello world");
 * @example
 * // replace default console
 *
 * const { LoggerBuilder } = require('@sgapps.io/server');
 * const logger = new LoggerBuilder();
 * logger.decorateGlobalLogger();
 *
 * console.log("Console Messages are decorated now");
 */
declare class LoggerBuilder {
    /**
     * <p>this parameter may be changed if you decide to change decoration schema</p>
     * @example
     * // Insert an message in VT100 format
     * logger._format = "\x1b[7m {{timestamp}} [{{TYPE}}] <{{title}}> {{file}}:{{line}} ({{method}}){{stack}}\x1b[7m";
     */
    _format: string;
    _debug: boolean;
    _headerFormatters: LoggerBuilder.headerFormatter[];
    prettyCli(ref: any, indent?: number, separator?: string): void;
    log(...messages: any[]): void;
    info(...messages: any[]): void;
    warn(...messages: any[]): void;
    error(...messages: any[]): void;
    /**
     * @example
     * logger.prompt("rerun tests? [y/n]: ", function (err, buffer) {
     * 	// trim spaces from response
     * 	var response = buffer.toString().replace(/^\s*(.*?)\s*$/, '$1');
     * 	if (response === 'y') {
     * 		// write your code
     * 	}
     * });
     */
    prompt(callback: LoggerBuilderPrompt, message: string | Buffer): void;
    decorateGlobalLogger(): void;
}

declare namespace LoggerBuilder {
    type headerFormatterInfo = {
        time: string;
        type: string;
        file: string;
        line: string;
        method: string;
        path: string;
        stack: string;
    };
    type headerFormatter = (info: LoggerBuilder.headerFormatterInfo) => void;
}

declare type LoggerBuilderPrompt = (message: Buffer) => void;

declare class SGAppsServerRequestCookie {
    get(name: string, options?: {
        secure?: boolean;
    }): string;
    set(name: string, value: string, options?: {
        secure?: boolean;
    }): string;
}

/**
 * @property fieldName - <p>field's name</p>
 * @property data.fileName - <p>file's name <code>[duplicate]</code></p>
 * @property data.encoding - <p>file's encoding</p>
 * @property data.fileStream - <p>() =&gt; fileStream</p>
 * @property data.fileSize - <p>size in bytes</p>
 * @property data.contentType - <p>file's mimeType</p>
 * @property data.loaded - <p>indicate if file is fully loaded into <code>fileData</code></p>
 */
declare type SGAppsServerRequestFile = {
    fieldName: string;
    data: {
        fileName: string;
        encoding: string;
        fileStream: Readable;
        fileData: Buffer;
        fileSize: number;
        contentType: string;
        loaded: boolean;
    };
};

/**
 * @property fieldName - <p>field's name</p>
 * @property data.encoding - <p>file's encoding</p>
 * @property data.mimeType - <p>file's mimeType</p>
 */
declare type SGAppsServerRequestPostDataItem = {
    fieldName: string;
    data: {
        value: string;
        encoding: string;
        valTruncated: string;
        fieldNameTruncated: Buffer;
        mimeType: string;
    };
};

declare class SGAppsServerRequestSession {
    constructor(request: SGAppsServerRequest, options: SGAppsSessionManagerOptions);
    _created: number;
    _ip: string;
    /**
     * <p>Session was received from previously saved cookie</p>
     */
    _confirmed: boolean;
    _id: string;
    _options: SGAppsSessionManagerOptions;
    data: any;
    destroy(): void;
}

declare type SGAppsSessionManagerOptions = {
    SESSION_LIFE?: number;
    cookie?: string;
};

declare type SGAppsServerRequestSessionCache = {
    expire: number;
    data: any;
};

declare class SGAppsSessionManager {
    constructor(server: SGAppsServer, options?: SGAppsSessionManagerOptions);
    _options: SGAppsSessionManagerOptions;
    _enabled: boolean;
    _sessions: {
        [key: string]: SGAppsServerRequestSessionCache;
    };
    removeExpiredSessions(): void;
    handleRequest(request: SGAppsServerRequest): void;
}

declare function RequestSessionDecorator(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any): void;

declare type MountUpdatedURL = string;

declare namespace SGAppsServerResponse {
    type pipeFileStaticCallback = (error: Error) => void;
}

declare class TemplateManager {
    constructor(options: {
        _fs: FSLibrary;
    });
    _options: {
        _fs: FSLibrary;
    };
    _viewer: TemplateManagerViewer;
    _env: {
        [key: string]: any;
    };
    templateExists(templateName: string): boolean;
    remove(templateName: string): void;
    add(templateName: string, filePath: string): void;
    addList(templates: {
        [key: string]: string;
    }): void;
    get(templateName: string): TemplateManagerTemplate;
    render(response: SGAppsServerResponse, templateName: string, vars?: {
        [key: string]: any;
    }): void;
}

declare type TemplateManagerTemplate = {
    name: string;
    path: string;
    code?: string;
};

declare class FaceboxTemplate {
    constructor(options: {
        _fs: FSLibrary;
    });
    _debug: boolean;
    _env: {
        [key: string]: any;
    };
    _cachedFiles: {
        [key: string]: string;
    };
    INCLUDE_LEVEL: number;
    render(this: FaceboxTemplate, text: string, vars: {
        [key: string]: any;
    }, env: {
        [key: string]: any;
    }): void;
    renderFile(this: FaceboxTemplate, filePath: string, vars: {
        [key: string]: any;
    }, callback: (...params: any[]) => any): void;
    renderCode(this: FaceboxTemplate, code: string, vars: {
        [key: string]: any;
    }, callback: (...params: any[]) => any, virtualFilePath: string): void;
}

declare type TemplateManagerRenderOptions = any;

declare class TemplateManagerViewer {
    constructor(options: {
        _fs: FSLibrary;
    });
    _facebox: FaceboxTemplate;
    _debug: boolean;
    _env: {
        [key: string]: any;
    };
    renderCode(code: string, vars: {
        [key: string]: any;
    }, virtualFilePath: string, callback: (...params: any[]) => any): void;
    render(this: TemplateManagerViewer, response: SGAppsServerResponse, view: TemplateManagerTemplate, vars: {
        [key: string]: any;
    }): void;
}

declare class SGAppsServerRequest {
    constructor(request: IncomingMessage, server: SGAppsServer);
    cookies: SGAppsServerRequestCookie;
    /**
     * <p>post data buffer cache</p>
     */
    _postDataBuffer: Buffer;
    body: any;
    bodyItems: SGAppsServerRequestPostDataItem[];
    files: {
        [key: string]: SGAppsServerRequestFile[];
    };
    /**
     * <p>request's post received data</p>
     */
    postData: Promise<Buffer>;
    session: SGAppsServerRequestSession;
    getMountUpdatedUrl(url: string): MountUpdatedURL;
    request: IncomingMessage;
    /**
     * @property domain - <p>full domain of url</p>
     * @property domain_short - <p>domain without &quot;www.&quot;</p>
     * @property pathname - <p>url's pathname</p>
     * @property reqQuery - <p>url's query from '?'</p>
     * @property protocol - <p>url.split('://')[0]</p>
     * @property isIp - <p>domain or Ip</p>
     */
    urlInfo: {
        original: string;
        origin: string;
        domain: string;
        domain_short: string;
        pathname: string;
        reqQuery: string;
        protocol: string;
        url: string;
        url_p: string;
        isIp: string;
    };
    query: any;
    mountPath: string;
    /**
     * @example
     * // changing max post size to 4Mb
     * request.MAX_POST_SIZE = 4 * 1024 * 1024;
     * @example
     * // reset max post size to global value
     * request.MAX_POST_SIZE = -1;
     */
    MAX_POST_SIZE: number;
    /**
     * <p>Array of functions to be called on response end</p>
     */
    _destroy: ((...params: any[]) => void)[];
    /**
     * <p>Array of functions to be called on response end</p>
     */
    params: SGAppsServerRequest.RequestParams;
    /**
     * <p>Array of functions to be called on response end</p>
     * @property complete - <p>The message.complete property will be true if a complete HTTP message has been received and successfully parsed.</p>
     * @property aborted - <p>The message.aborted property will be true if the request has been aborted.</p>
     * @property closed - <p>Indicates that the underlying connection was closed.</p>
     */
    _flags: {
        complete: boolean;
        aborted: boolean;
        closed: boolean;
    };
}

declare namespace SGAppsServerRequest {
    type RequestParams = {
        [key: string]: string;
    } | string[];
}

declare class SGAppsServerResponse {
    constructor(response: ServerResponse, server: SGAppsServer);
    sendError(error: Error, options?: {
        statusCode?: number;
    }): void;
    pipeFileStatic(filePath: string, fileName: string, callback: SGAppsServerResponse.pipeFileStaticCallback): void;
    /**
     * @param callback - <p>represents a <code>Function(Error)</code></p>
     */
    pipeFile(filePath: string, callback: SGAppsServerErrorOnlyCallback): void;
    /**
     * <p>if it returns <code>false</code> than the action was not possible</p>
     */
    redirect(url: string, options?: {
        statusCode?: number;
        headers?: {
            [key: string]: string | string[];
        };
    }): void;
    send(data: string | Buffer | any | any[], options?: {
        statusCode?: number;
        headers?: {
            [key: string]: string | string[];
        };
    }): void;
    sendStatusCode(statusCode: number): void;
    response: ServerResponse;
    /**
     * <p>Array of functions to be called on response end</p>
     */
    _destroy: ((...params: any[]) => void)[];
    /**
     * <p>Array of functions to be called on response end</p>
     * @property finished - <p>will be true if response.end() has been called.</p>
     * @property sent - <p>Is true if all data has been flushed to the underlying system, immediately before the 'finish' event is emitted.</p>
     * @property closed - <p>Indicates that the the response is completed, or its underlying connection was terminated prematurely (before the response completion).</p>
     */
    _flags: {
        finished: boolean;
        sent: boolean;
        closed: boolean;
    };
}

declare class SGAppsServerDecoratorsLibrary {
    /**
     * <p>this decorator is not enabled by default</p>
     */
    static NodeJsMvcDecorator(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any): void;
}

declare type SGAppsServerErrorCallBack = (err: Error, request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

declare type SGAppsServerErrorOnlyCallback = (err: Error) => void;

declare interface FSLibrary extends FSLibraryModule {
}

declare class FSLibrary implements FSLibraryModule {
}

declare class SGAppsServerShared {
}

declare type SGAppsServerDecorator = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any) => void;

declare type RequestPathStructure = string | RegExp;

declare type RequestHandler = (request: SGAppsServerRequest, response: SGAppsServerResponse, next: (...params: any[]) => any) => void;

declare type SGAppsServerOptions = {
    server?: Server;
    strictRouting?: boolean;
    _DEBUG_MAX_HANDLER_EXECUTION_TIME?: number;
};

/**
 * <p>HTTP Server for high performance results</p>
 * @example
 * // ================================
 * //   Start your 🚀 Web-Server app
 * // ================================
 *
 * const { SGAppsServer } = require('@sgapps.io/server');
 * const app = new SGAppsServer();
 *
 * app.get('/', function (req, res) {
 *   res.send('hello world')
 * })
 *
 * app.server().listen(8080, () => {
 *   app.logger.log('Server is running on port 8080');
 * })
 * @example
 * // ========================================
 * //   Start your 🚀 Web-Server app Extended
 * // ========================================
 *
 * const { SGAppsServer } = require('@sgapps.io/server');
 * const app = new SGAppsServer();
 *
 * app.get('/', function (req, res) {
 *   res.send('hello world')
 * })
 *
 * app.whenReady.then(() => {
 *   app.SessionManager.cookie = 'ssid';
 *   app.SessionManager.SESSION_LIFE = 120; // seconds
 *
 *   app.server().listen(8080, () => {
 *     app.logger.log('Server is running on port 8080');
 *   })
 * }, app.logger.error);
 * @param [options._DEBUG_MAX_HANDLER_EXECUTION_TIME = 500] - <p>console shows an warn if handler is executed more than ( works in debug mode )</p>
 */
declare class SGAppsServer {
    constructor(options?: {
        server?: Server;
        strictRouting?: boolean;
        _DEBUG_MAX_HANDLER_EXECUTION_TIME?: any;
        decorators?: SGAppsServerDecorator[];
    });
    NodeJsMvc: SGAppsServer.NodeJsMvc;
    /**
     * @property [_enabled = true] - <p>if is changed to false server will not decorate requests with cookie manager</p>
     */
    CookiesManager: {
        COOKIES_KEY: string;
        _enabled?: boolean;
        handle: (...params: any[]) => any;
    };
    SessionManager: SGAppsSessionManager;
    TemplateManager: TemplateManager;
    _server: Server;
    _decorators: SGAppsServerDecorator[];
    _options: SGAppsServerOptions;
    STATUS_CODES: {
        [key: number]: string;
    };
    shared: SGAppsServerShared;
    logger: LoggerBuilder;
    Email(config: SGAppsServerEmail.Config): SGAppsServerEmail;
    mountPath: string;
    _fs: any;
    _path: any;
    EXTENSIONS: ResourcesExtensions;
    _requestListeners: {
        [key: string]: SGAppsServerDictionary;
    };
    /**
     * <p>default value is <code>16 Kb</code> » <code>16 * 1024</code></p>
     */
    MAX_POST_SIZE: number;
    whenReady: Promise<SGAppsServer>;
    handleRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, callback: SGAppsServerDictionaryRunCallBack): void;
    handleStaticRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, path: string, callback: SGAppsServerErrorCallBack): void;
    handle(request: IncomingMessage, response: ServerResponse, callback?: SGAppsServerDictionaryRunCallBack): void;
    server(): Server;
    use(path: string | RequestHandler, ...handlers?: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>POST</code> method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.</p>
     */
    post(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>GET</code> method requests a representation of the specified resource. Requests using GET should only retrieve data.</p>
     */
    get(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>HEAD</code> method asks for a response identical to that of a GET request, but without the response body.</p>
     */
    head(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>PUT</code> method replaces all current representations of the target resource with the request payload.</p>
     */
    put(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>TRACE</code> method performs a message loop-back test along the path to the target resource.</p>
     */
    trace(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>DELETE</code> method deletes the specified resource.</p>
     */
    delete(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>OPTIONS</code> method is used to describe the communication options for the target resource.</p>
     */
    options(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>CONNECT</code> method establishes a tunnel to the server identified by the target resource.</p>
     */
    connect(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>PATCH</code> method is used to apply partial modifications to a resource.</p>
     */
    patch(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>add handler to all methods</p>
     */
    all(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>add final handler to all methods, last added is first</p>
     */
    finalHandler(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    handlePostData(options?: {
        MAX_POST_SIZE?: number;
        error?: {
            statusCode: number;
            message?: string;
        };
    }): SGAppsServerHandlerPostData;
}

declare type SGAppsServerHandlerPostData = (request: SGAppsServerRequest, response: SGAppsServerResponse, next: (...params: any[]) => any) => void;

declare type ResourcesExtensions = {
    mime: (...params: any[]) => any;
    LIST_ASSOC: {
        [key: string]: string;
    };
};

// incoming headers will never contain number
interface IncomingHttpHeaders extends NodeJS.Dict<string | string[]> {
    'accept'?: string;
    'accept-language'?: string;
    'accept-patch'?: string;
    'accept-ranges'?: string;
    'access-control-allow-credentials'?: string;
    'access-control-allow-headers'?: string;
    'access-control-allow-methods'?: string;
    'access-control-allow-origin'?: string;
    'access-control-expose-headers'?: string;
    'access-control-max-age'?: string;
    'access-control-request-headers'?: string;
    'access-control-request-method'?: string;
    'age'?: string;
    'allow'?: string;
    'alt-svc'?: string;
    'authorization'?: string;
    'cache-control'?: string;
    'connection'?: string;
    'content-disposition'?: string;
    'content-encoding'?: string;
    'content-language'?: string;
    'content-length'?: string;
    'content-location'?: string;
    'content-range'?: string;
    'content-type'?: string;
    'cookie'?: string;
    'date'?: string;
    'expect'?: string;
    'expires'?: string;
    'forwarded'?: string;
    'from'?: string;
    'host'?: string;
    'if-match'?: string;
    'if-modified-since'?: string;
    'if-none-match'?: string;
    'if-unmodified-since'?: string;
    'last-modified'?: string;
    'location'?: string;
    'origin'?: string;
    'pragma'?: string;
    'proxy-authenticate'?: string;
    'proxy-authorization'?: string;
    'public-key-pins'?: string;
    'range'?: string;
    'referer'?: string;
    'retry-after'?: string;
    'set-cookie'?: string[];
    'strict-transport-security'?: string;
    'tk'?: string;
    'trailer'?: string;
    'transfer-encoding'?: string;
    'upgrade'?: string;
    'user-agent'?: string;
    'vary'?: string;
    'via'?: string;
    'warning'?: string;
    'www-authenticate'?: string;
}

// outgoing headers allows numbers (as they are converted internally to strings)
interface OutgoingHttpHeaders extends NodeJS.Dict<number | string | string[]> {
}

interface ClientRequestArgs {
    protocol?: string | null;
    host?: string | null;
    hostname?: string | null;
    family?: number;
    port?: number | string | null;
    defaultPort?: number | string;
    localAddress?: string;
    socketPath?: string;
    /**
     * @default 8192
     */
    maxHeaderSize?: number;
    method?: string;
    path?: string | null;
    headers?: OutgoingHttpHeaders;
    auth?: string | null;
    agent?: Agent | boolean;
    _defaultAgent?: Agent;
    timeout?: number;
    setHost?: boolean;
    // https://github.com/nodejs/node/blob/master/lib/_http_client.js#L278
    createConnection?: (options: ClientRequestArgs, oncreate: (err: Error, socket: Socket) => void) => Socket;
}

interface ServerOptions {
    IncomingMessage?: typeof IncomingMessage;
    ServerResponse?: typeof ServerResponse;
    /**
     * Optionally overrides the value of
     * [`--max-http-header-size`][] for requests received by this server, i.e.
     * the maximum length of request headers in bytes.
     * @default 8192
     */
    maxHeaderSize?: number;
    /**
     * Use an insecure HTTP parser that accepts invalid HTTP headers when true.
     * Using the insecure parser should be avoided.
     * See --insecure-http-parser for more information.
     * @default false
     */
    insecureHTTPParser?: boolean;
}

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

interface HttpBase {
    setTimeout(msecs?: number, callback?: () => void): this;
    setTimeout(callback: () => void): this;
    /**
     * Limits maximum incoming headers count. If set to 0, no limit will be applied.
     * @default 2000
     * {@link https://nodejs.org/api/http.html#http_server_maxheaderscount}
     */
    maxHeadersCount: number | null;
    timeout: number;
    /**
     * Limit the amount of time the parser will wait to receive the complete HTTP headers.
     * @default 60000
     * {@link https://nodejs.org/api/http.html#http_server_headerstimeout}
     */
    headersTimeout: number;
    keepAliveTimeout: number;
}

interface Server extends HttpBase {}
class Server extends NetServer {
    constructor(requestListener?: RequestListener);
    constructor(options: ServerOptions, requestListener?: RequestListener);
}

// https://github.com/nodejs/node/blob/master/lib/_http_outgoing.js
class OutgoingMessage extends Writable {
    upgrading: boolean;
    chunkedEncoding: boolean;
    shouldKeepAlive: boolean;
    useChunkedEncodingByDefault: boolean;
    sendDate: boolean;
    /**
     * @deprecated Use `writableEnded` instead.
     */
    finished: boolean;
    headersSent: boolean;
    /**
     * @deprecate Use `socket` instead.
     */
    connection: Socket;
    socket: Socket;

    constructor();

    setTimeout(msecs: number, callback?: () => void): this;
    setHeader(name: string, value: number | string | string[]): void;
    getHeader(name: string): number | string | string[] | undefined;
    getHeaders(): OutgoingHttpHeaders;
    getHeaderNames(): string[];
    hasHeader(name: string): boolean;
    removeHeader(name: string): void;
    addTrailers(headers: OutgoingHttpHeaders | Array<[string, string]>): void;
    flushHeaders(): void;
}

// https://github.com/nodejs/node/blob/master/lib/_http_server.js#L108-L256
class ServerResponse extends OutgoingMessage {
    statusCode: number;
    statusMessage: string;

    constructor(req: IncomingMessage);

    assignSocket(socket: Socket): void;
    detachSocket(socket: Socket): void;
    // https://github.com/nodejs/node/blob/master/test/parallel/test-http-write-callbacks.js#L53
    // no args in writeContinue callback
    writeContinue(callback?: () => void): void;
    writeHead(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders): this;
    writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
    writeProcessing(): void;
}

interface InformationEvent {
    statusCode: number;
    statusMessage: string;
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    headers: IncomingHttpHeaders;
    rawHeaders: string[];
}

// https://github.com/nodejs/node/blob/master/lib/_http_client.js#L77
class ClientRequest extends OutgoingMessage {
    connection: Socket;
    socket: Socket;
    aborted: number;

    constructor(url: string | URL | ClientRequestArgs, cb?: (res: IncomingMessage) => void);

    method: string;
    path: string;
    abort(): void;
    onSocket(socket: Socket): void;
    setTimeout(timeout: number, callback?: () => void): this;
    setNoDelay(noDelay?: boolean): void;
    setSocketKeepAlive(enable?: boolean, initialDelay?: number): void;

    addListener(event: 'abort', listener: () => void): this;
    addListener(event: 'connect', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    addListener(event: 'continue', listener: () => void): this;
    addListener(event: 'information', listener: (info: InformationEvent) => void): this;
    addListener(event: 'response', listener: (response: IncomingMessage) => void): this;
    addListener(event: 'socket', listener: (socket: Socket) => void): this;
    addListener(event: 'timeout', listener: () => void): this;
    addListener(event: 'upgrade', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    addListener(event: 'close', listener: () => void): this;
    addListener(event: 'drain', listener: () => void): this;
    addListener(event: 'error', listener: (err: Error) => void): this;
    addListener(event: 'finish', listener: () => void): this;
    addListener(event: 'pipe', listener: (src: Readable) => void): this;
    addListener(event: 'unpipe', listener: (src: Readable) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;

    on(event: 'abort', listener: () => void): this;
    on(event: 'connect', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    on(event: 'continue', listener: () => void): this;
    on(event: 'information', listener: (info: InformationEvent) => void): this;
    on(event: 'response', listener: (response: IncomingMessage) => void): this;
    on(event: 'socket', listener: (socket: Socket) => void): this;
    on(event: 'timeout', listener: () => void): this;
    on(event: 'upgrade', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: 'drain', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'finish', listener: () => void): this;
    on(event: 'pipe', listener: (src: Readable) => void): this;
    on(event: 'unpipe', listener: (src: Readable) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    once(event: 'abort', listener: () => void): this;
    once(event: 'connect', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    once(event: 'continue', listener: () => void): this;
    once(event: 'information', listener: (info: InformationEvent) => void): this;
    once(event: 'response', listener: (response: IncomingMessage) => void): this;
    once(event: 'socket', listener: (socket: Socket) => void): this;
    once(event: 'timeout', listener: () => void): this;
    once(event: 'upgrade', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    once(event: 'close', listener: () => void): this;
    once(event: 'drain', listener: () => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: 'finish', listener: () => void): this;
    once(event: 'pipe', listener: (src: Readable) => void): this;
    once(event: 'unpipe', listener: (src: Readable) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;

    prependListener(event: 'abort', listener: () => void): this;
    prependListener(event: 'connect', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    prependListener(event: 'continue', listener: () => void): this;
    prependListener(event: 'information', listener: (info: InformationEvent) => void): this;
    prependListener(event: 'response', listener: (response: IncomingMessage) => void): this;
    prependListener(event: 'socket', listener: (socket: Socket) => void): this;
    prependListener(event: 'timeout', listener: () => void): this;
    prependListener(event: 'upgrade', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    prependListener(event: 'close', listener: () => void): this;
    prependListener(event: 'drain', listener: () => void): this;
    prependListener(event: 'error', listener: (err: Error) => void): this;
    prependListener(event: 'finish', listener: () => void): this;
    prependListener(event: 'pipe', listener: (src: Readable) => void): this;
    prependListener(event: 'unpipe', listener: (src: Readable) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

    prependOnceListener(event: 'abort', listener: () => void): this;
    prependOnceListener(event: 'connect', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    prependOnceListener(event: 'continue', listener: () => void): this;
    prependOnceListener(event: 'information', listener: (info: InformationEvent) => void): this;
    prependOnceListener(event: 'response', listener: (response: IncomingMessage) => void): this;
    prependOnceListener(event: 'socket', listener: (socket: Socket) => void): this;
    prependOnceListener(event: 'timeout', listener: () => void): this;
    prependOnceListener(event: 'upgrade', listener: (response: IncomingMessage, socket: Socket, head: Buffer) => void): this;
    prependOnceListener(event: 'close', listener: () => void): this;
    prependOnceListener(event: 'drain', listener: () => void): this;
    prependOnceListener(event: 'error', listener: (err: Error) => void): this;
    prependOnceListener(event: 'finish', listener: () => void): this;
    prependOnceListener(event: 'pipe', listener: (src: Readable) => void): this;
    prependOnceListener(event: 'unpipe', listener: (src: Readable) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

class IncomingMessage extends ClientRequest extends Readable {
    constructor(socket: Socket);

    aborted: boolean;
    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    complete: boolean;
    /**
     * @deprecate Use `socket` instead.
     */
    connection: Socket;
    socket: Socket;
    headers: IncomingHttpHeaders;
    rawHeaders: string[];
    trailers: NodeJS.Dict<string>;
    rawTrailers: string[];
    setTimeout(msecs: number, callback?: () => void): this;
    /**
     * Only valid for request obtained from http.Server.
     */
    method?: string;
    /**
     * Only valid for request obtained from http.Server.
     */
    url?: string;
    /**
     * Only valid for response obtained from http.ClientRequest.
     */
    statusCode?: number;
    /**
     * Only valid for response obtained from http.ClientRequest.
     */
    statusMessage?: string;
    destroy(error?: Error): void;
}

interface AgentOptions {
    /**
     * Keep sockets around in a pool to be used by other requests in the future. Default = false
     */
    keepAlive?: boolean;
    /**
     * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
     * Only relevant if keepAlive is set to true.
     */
    keepAliveMsecs?: number;
    /**
     * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
     */
    maxSockets?: number;
    /**
     * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
     */
    maxFreeSockets?: number;
    /**
     * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
     */
    timeout?: number;
}

class Agent {
    maxFreeSockets: number;
    maxSockets: number;
    readonly freeSockets: NodeJS.ReadOnlyDict<Socket[]>;
    readonly sockets: NodeJS.ReadOnlyDict<Socket[]>;
    readonly requests: NodeJS.ReadOnlyDict<IncomingMessage[]>;

    constructor(opts?: AgentOptions);

    /**
     * Destroy any sockets that are currently in use by the agent.
     * It is usually not necessary to do this. However, if you are using an agent with KeepAlive enabled,
     * then it is best to explicitly shut down the agent when you know that it will no longer be used. Otherwise,
     * sockets may hang open for quite a long time before the server terminates them.
     */
    destroy(): void;
}

const METHODS: string[];

const STATUS_CODES: {
    [errorCode: number]: string | undefined;
    [errorCode: string]: string | undefined;
};

function createServer(requestListener?: RequestListener): Server;
function createServer(options: ServerOptions, requestListener?: RequestListener): Server;

// although RequestOptions are passed as ClientRequestArgs to ClientRequest directly,
// create interface RequestOptions would make the naming more clear to developers
interface RequestOptions extends ClientRequestArgs { }
function request(options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void): ClientRequest;
function request(url: string | URL, options: RequestOptions, callback?: (res: IncomingMessage) => void): ClientRequest;
function get(options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void): ClientRequest;
function get(url: string | URL, options: RequestOptions, callback?: (res: IncomingMessage) => void): ClientRequest;
let globalAgent: Agent;

/**
 * Read-only property specifying the maximum allowed size of HTTP headers in bytes.
 * Defaults to 16KB. Configurable using the [`--max-http-header-size`][] CLI option.
 */
const maxHeaderSize: number;class internal extends EventEmitter {
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T;
}

class Stream extends internal {
    constructor(opts?: ReadableOptions);
}

interface ReadableOptions {
    highWaterMark?: number;
    encoding?: BufferEncoding;
    objectMode?: boolean;
    read?(this: Readable, size: number): void;
    destroy?(this: Readable, error: Error | null, callback: (error: Error | null) => void): void;
    autoDestroy?: boolean;
}

class Readable extends Stream implements NodeJS.ReadableStream {
    /**
     * A utility method for creating Readable Streams out of iterators.
     */
    static from(iterable: Iterable<any> | AsyncIterable<any>, options?: ReadableOptions): Readable;

    readable: boolean;
    readonly readableEncoding: BufferEncoding | null;
    readonly readableEnded: boolean;
    readonly readableFlowing: boolean | null;
    readonly readableHighWaterMark: number;
    readonly readableLength: number;
    readonly readableObjectMode: boolean;
    destroyed: boolean;
    constructor(opts?: ReadableOptions);
    _read(size: number): void;
    read(size?: number): any;
    setEncoding(encoding: BufferEncoding): this;
    pause(): this;
    resume(): this;
    isPaused(): boolean;
    unpipe(destination?: NodeJS.WritableStream): this;
    unshift(chunk: any, encoding?: BufferEncoding): void;
    wrap(oldStream: NodeJS.ReadableStream): this;
    push(chunk: any, encoding?: BufferEncoding): boolean;
    _destroy(error: Error | null, callback: (error?: Error | null) => void): void;
    destroy(error?: Error): void;

    /**
     * Event emitter
     * The defined events on documents including:
     * 1. close
     * 2. data
     * 3. end
     * 4. error
     * 5. pause
     * 6. readable
     * 7. resume
     */
    addListener(event: "close", listener: () => void): this;
    addListener(event: "data", listener: (chunk: any) => void): this;
    addListener(event: "end", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "pause", listener: () => void): this;
    addListener(event: "readable", listener: () => void): this;
    addListener(event: "resume", listener: () => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;

    emit(event: "close"): boolean;
    emit(event: "data", chunk: any): boolean;
    emit(event: "end"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "pause"): boolean;
    emit(event: "readable"): boolean;
    emit(event: "resume"): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;

    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: any) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "pause", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "resume", listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    once(event: "close", listener: () => void): this;
    once(event: "data", listener: (chunk: any) => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "pause", listener: () => void): this;
    once(event: "readable", listener: () => void): this;
    once(event: "resume", listener: () => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;

    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "data", listener: (chunk: any) => void): this;
    prependListener(event: "end", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "pause", listener: () => void): this;
    prependListener(event: "readable", listener: () => void): this;
    prependListener(event: "resume", listener: () => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "data", listener: (chunk: any) => void): this;
    prependOnceListener(event: "end", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "pause", listener: () => void): this;
    prependOnceListener(event: "readable", listener: () => void): this;
    prependOnceListener(event: "resume", listener: () => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "data", listener: (chunk: any) => void): this;
    removeListener(event: "end", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "pause", listener: () => void): this;
    removeListener(event: "readable", listener: () => void): this;
    removeListener(event: "resume", listener: () => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;

    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
}

interface WritableOptions {
    highWaterMark?: number;
    decodeStrings?: boolean;
    defaultEncoding?: BufferEncoding;
    objectMode?: boolean;
    emitClose?: boolean;
    write?(this: Writable, chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    writev?(this: Writable, chunks: Array<{ chunk: any, encoding: BufferEncoding }>, callback: (error?: Error | null) => void): void;
    destroy?(this: Writable, error: Error | null, callback: (error: Error | null) => void): void;
    final?(this: Writable, callback: (error?: Error | null) => void): void;
    autoDestroy?: boolean;
}

class Writable extends Stream implements NodeJS.WritableStream {
    readonly writable: boolean;
    readonly writableEnded: boolean;
    readonly writableFinished: boolean;
    readonly writableHighWaterMark: number;
    readonly writableLength: number;
    readonly writableObjectMode: boolean;
    readonly writableCorked: number;
    destroyed: boolean;
    constructor(opts?: WritableOptions);
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    _writev?(chunks: Array<{ chunk: any, encoding: BufferEncoding }>, callback: (error?: Error | null) => void): void;
    _destroy(error: Error | null, callback: (error?: Error | null) => void): void;
    _final(callback: (error?: Error | null) => void): void;
    write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
    write(chunk: any, encoding: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean;
    setDefaultEncoding(encoding: BufferEncoding): this;
    end(cb?: () => void): void;
    end(chunk: any, cb?: () => void): void;
    end(chunk: any, encoding: BufferEncoding, cb?: () => void): void;
    cork(): void;
    uncork(): void;
    destroy(error?: Error): void;

    /**
     * Event emitter
     * The defined events on documents including:
     * 1. close
     * 2. drain
     * 3. error
     * 4. finish
     * 5. pipe
     * 6. unpipe
     */
    addListener(event: "close", listener: () => void): this;
    addListener(event: "drain", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "finish", listener: () => void): this;
    addListener(event: "pipe", listener: (src: Readable) => void): this;
    addListener(event: "unpipe", listener: (src: Readable) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;

    emit(event: "close"): boolean;
    emit(event: "drain"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "finish"): boolean;
    emit(event: "pipe", src: Readable): boolean;
    emit(event: "unpipe", src: Readable): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;

    on(event: "close", listener: () => void): this;
    on(event: "drain", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "finish", listener: () => void): this;
    on(event: "pipe", listener: (src: Readable) => void): this;
    on(event: "unpipe", listener: (src: Readable) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;

    once(event: "close", listener: () => void): this;
    once(event: "drain", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "finish", listener: () => void): this;
    once(event: "pipe", listener: (src: Readable) => void): this;
    once(event: "unpipe", listener: (src: Readable) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;

    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "drain", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "finish", listener: () => void): this;
    prependListener(event: "pipe", listener: (src: Readable) => void): this;
    prependListener(event: "unpipe", listener: (src: Readable) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "drain", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "finish", listener: () => void): this;
    prependOnceListener(event: "pipe", listener: (src: Readable) => void): this;
    prependOnceListener(event: "unpipe", listener: (src: Readable) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "drain", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "finish", listener: () => void): this;
    removeListener(event: "pipe", listener: (src: Readable) => void): this;
    removeListener(event: "unpipe", listener: (src: Readable) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
}

interface DuplexOptions extends ReadableOptions, WritableOptions {
    allowHalfOpen?: boolean;
    readableObjectMode?: boolean;
    writableObjectMode?: boolean;
    readableHighWaterMark?: number;
    writableHighWaterMark?: number;
    writableCorked?: number;
    read?(this: Duplex, size: number): void;
    write?(this: Duplex, chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    writev?(this: Duplex, chunks: Array<{ chunk: any, encoding: BufferEncoding }>, callback: (error?: Error | null) => void): void;
    final?(this: Duplex, callback: (error?: Error | null) => void): void;
    destroy?(this: Duplex, error: Error | null, callback: (error: Error | null) => void): void;
}

// Note: Duplex extends both Readable and Writable.
class Duplex extends Readable implements Writable {
    readonly writable: boolean;
    readonly writableEnded: boolean;
    readonly writableFinished: boolean;
    readonly writableHighWaterMark: number;
    readonly writableLength: number;
    readonly writableObjectMode: boolean;
    readonly writableCorked: number;
    constructor(opts?: DuplexOptions);
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    _writev?(chunks: Array<{ chunk: any, encoding: BufferEncoding }>, callback: (error?: Error | null) => void): void;
    _destroy(error: Error | null, callback: (error: Error | null) => void): void;
    _final(callback: (error?: Error | null) => void): void;
    write(chunk: any, encoding?: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean;
    write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
    setDefaultEncoding(encoding: BufferEncoding): this;
    end(cb?: () => void): void;
    end(chunk: any, cb?: () => void): void;
    end(chunk: any, encoding?: BufferEncoding, cb?: () => void): void;
    cork(): void;
    uncork(): void;
}

type TransformCallback = (error?: Error | null, data?: any) => void;

interface TransformOptions extends DuplexOptions {
    read?(this: Transform, size: number): void;
    write?(this: Transform, chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    writev?(this: Transform, chunks: Array<{ chunk: any, encoding: BufferEncoding }>, callback: (error?: Error | null) => void): void;
    final?(this: Transform, callback: (error?: Error | null) => void): void;
    destroy?(this: Transform, error: Error | null, callback: (error: Error | null) => void): void;
    transform?(this: Transform, chunk: any, encoding: BufferEncoding, callback: TransformCallback): void;
    flush?(this: Transform, callback: TransformCallback): void;
}

class Transform extends Duplex {
    constructor(opts?: TransformOptions);
    _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void;
    _flush(callback: TransformCallback): void;
}

class PassThrough extends Transform { }

interface FinishedOptions {
    error?: boolean;
    readable?: boolean;
    writable?: boolean;
}
function finished(stream: NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream, options: FinishedOptions, callback: (err?: NodeJS.ErrnoException | null) => void): () => void;
function finished(stream: NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream, callback: (err?: NodeJS.ErrnoException | null) => void): () => void;
namespace finished {
    function __promisify__(stream: NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream, options?: FinishedOptions): Promise<void>;
}

function pipeline<T extends NodeJS.WritableStream>(stream1: NodeJS.ReadableStream, stream2: T, callback?: (err: NodeJS.ErrnoException | null) => void): T;
function pipeline<T extends NodeJS.WritableStream>(stream1: NodeJS.ReadableStream, stream2: NodeJS.ReadWriteStream, stream3: T, callback?: (err: NodeJS.ErrnoException | null) => void): T;
function pipeline<T extends NodeJS.WritableStream>(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream,
    stream3: NodeJS.ReadWriteStream,
    stream4: T,
    callback?: (err: NodeJS.ErrnoException | null) => void,
): T;
function pipeline<T extends NodeJS.WritableStream>(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream,
    stream3: NodeJS.ReadWriteStream,
    stream4: NodeJS.ReadWriteStream,
    stream5: T,
    callback?: (err: NodeJS.ErrnoException | null) => void,
): T;
function pipeline(streams: Array<NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream>, callback?: (err: NodeJS.ErrnoException | null) => void): NodeJS.WritableStream;
function pipeline(
    stream1: NodeJS.ReadableStream,
    stream2: NodeJS.ReadWriteStream | NodeJS.WritableStream,
    ...streams: Array<NodeJS.ReadWriteStream | NodeJS.WritableStream | ((err: NodeJS.ErrnoException | null) => void)>,
): NodeJS.WritableStream;
namespace pipeline {
    function __promisify__(stream1: NodeJS.ReadableStream, stream2: NodeJS.WritableStream): Promise<void>;
    function __promisify__(stream1: NodeJS.ReadableStream, stream2: NodeJS.ReadWriteStream, stream3: NodeJS.WritableStream): Promise<void>;
    function __promisify__(stream1: NodeJS.ReadableStream, stream2: NodeJS.ReadWriteStream, stream3: NodeJS.ReadWriteStream, stream4: NodeJS.WritableStream): Promise<void>;
    function __promisify__(
        stream1: NodeJS.ReadableStream,
        stream2: NodeJS.ReadWriteStream,
        stream3: NodeJS.ReadWriteStream,
        stream4: NodeJS.ReadWriteStream,
        stream5: NodeJS.WritableStream,
    ): Promise<void>;
    function __promisify__(streams: Array<NodeJS.ReadableStream | NodeJS.WritableStream | NodeJS.ReadWriteStream>): Promise<void>;
    function __promisify__(
        stream1: NodeJS.ReadableStream,
        stream2: NodeJS.ReadWriteStream | NodeJS.WritableStream,
        ...streams: Array<NodeJS.ReadWriteStream | NodeJS.WritableStream>,
    ): Promise<void>;
}

interface Pipe {
    close(): void;
    hasRef(): boolean;
    ref(): void;
    unref(): void;
}
type LookupFunction = (hostname: string, options: dns.LookupOneOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => void;

interface AddressInfo {
    address: string;
    family: string;
    port: number;
}

interface SocketConstructorOpts {
    fd?: number;
    allowHalfOpen?: boolean;
    readable?: boolean;
    writable?: boolean;
}

interface OnReadOpts {
    buffer: Uint8Array | (() => Uint8Array);
    /**
     * This function is called for every chunk of incoming data.
     * Two arguments are passed to it: the number of bytes written to buffer and a reference to buffer.
     * Return false from this function to implicitly pause() the socket.
     */
    callback(bytesWritten: number, buf: Uint8Array): boolean;
}

interface ConnectOpts {
    /**
     * If specified, incoming data is stored in a single buffer and passed to the supplied callback when data arrives on the socket.
     * Note: this will cause the streaming functionality to not provide any data, however events like 'error', 'end', and 'close' will
     * still be emitted as normal and methods like pause() and resume() will also behave as expected.
     */
    onread?: OnReadOpts;
}

interface TcpSocketConnectOpts extends ConnectOpts {
    port: number;
    host?: string;
    localAddress?: string;
    localPort?: number;
    hints?: number;
    family?: number;
    lookup?: LookupFunction;
}

interface IpcSocketConnectOpts extends ConnectOpts {
    path: string;
}

type SocketConnectOpts = TcpSocketConnectOpts | IpcSocketConnectOpts;

class Socket extends Duplex {
    constructor(options?: SocketConstructorOpts);

    // Extended base methods
    write(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
    write(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;

    connect(options: SocketConnectOpts, connectionListener?: () => void): this;
    connect(port: number, host: string, connectionListener?: () => void): this;
    connect(port: number, connectionListener?: () => void): this;
    connect(path: string, connectionListener?: () => void): this;

    setEncoding(encoding?: BufferEncoding): this;
    pause(): this;
    resume(): this;
    setTimeout(timeout: number, callback?: () => void): this;
    setNoDelay(noDelay?: boolean): this;
    setKeepAlive(enable?: boolean, initialDelay?: number): this;
    address(): AddressInfo | string;
    unref(): this;
    ref(): this;

    readonly bufferSize: number;
    readonly bytesRead: number;
    readonly bytesWritten: number;
    readonly connecting: boolean;
    readonly destroyed: boolean;
    readonly localAddress: string;
    readonly localPort: number;
    readonly remoteAddress?: string;
    readonly remoteFamily?: string;
    readonly remotePort?: number;

    // Extended base methods
    end(cb?: () => void): void;
    end(buffer: Uint8Array | string, cb?: () => void): void;
    end(str: Uint8Array | string, encoding?: BufferEncoding, cb?: () => void): void;

    /**
     * events.EventEmitter
     *   1. close
     *   2. connect
     *   3. data
     *   4. drain
     *   5. end
     *   6. error
     *   7. lookup
     *   8. timeout
     */
    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: "close", listener: (had_error: boolean) => void): this;
    addListener(event: "connect", listener: () => void): this;
    addListener(event: "data", listener: (data: Buffer) => void): this;
    addListener(event: "drain", listener: () => void): this;
    addListener(event: "end", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "lookup", listener: (err: Error, address: string, family: string | number, host: string) => void): this;
    addListener(event: "timeout", listener: () => void): this;

    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: "close", had_error: boolean): boolean;
    emit(event: "connect"): boolean;
    emit(event: "data", data: Buffer): boolean;
    emit(event: "drain"): boolean;
    emit(event: "end"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "lookup", err: Error, address: string, family: string | number, host: string): boolean;
    emit(event: "timeout"): boolean;

    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "close", listener: (had_error: boolean) => void): this;
    on(event: "connect", listener: () => void): this;
    on(event: "data", listener: (data: Buffer) => void): this;
    on(event: "drain", listener: () => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "lookup", listener: (err: Error, address: string, family: string | number, host: string) => void): this;
    on(event: "timeout", listener: () => void): this;

    once(event: string, listener: (...args: any[]) => void): this;
    once(event: "close", listener: (had_error: boolean) => void): this;
    once(event: "connect", listener: () => void): this;
    once(event: "data", listener: (data: Buffer) => void): this;
    once(event: "drain", listener: () => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "lookup", listener: (err: Error, address: string, family: string | number, host: string) => void): this;
    once(event: "timeout", listener: () => void): this;

    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: "close", listener: (had_error: boolean) => void): this;
    prependListener(event: "connect", listener: () => void): this;
    prependListener(event: "data", listener: (data: Buffer) => void): this;
    prependListener(event: "drain", listener: () => void): this;
    prependListener(event: "end", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "lookup", listener: (err: Error, address: string, family: string | number, host: string) => void): this;
    prependListener(event: "timeout", listener: () => void): this;

    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: "close", listener: (had_error: boolean) => void): this;
    prependOnceListener(event: "connect", listener: () => void): this;
    prependOnceListener(event: "data", listener: (data: Buffer) => void): this;
    prependOnceListener(event: "drain", listener: () => void): this;
    prependOnceListener(event: "end", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "lookup", listener: (err: Error, address: string, family: string | number, host: string) => void): this;
    prependOnceListener(event: "timeout", listener: () => void): this;
}

interface ListenOptions {
    port?: number;
    host?: string;
    backlog?: number;
    path?: string;
    exclusive?: boolean;
    readableAll?: boolean;
    writableAll?: boolean;
    /**
     * @default false
     */
    ipv6Only?: boolean;
}

// https://github.com/nodejs/node/blob/master/lib/net.js
class NetServer extends EventEmitter {
    constructor(connectionListener?: (socket: Socket) => void);
    constructor(options?: { allowHalfOpen?: boolean, pauseOnConnect?: boolean }, connectionListener?: (socket: Socket) => void);

    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    listen(port?: number, hostname?: string, listeningListener?: () => void): this;
    listen(port?: number, backlog?: number, listeningListener?: () => void): this;
    listen(port?: number, listeningListener?: () => void): this;
    listen(path: string, backlog?: number, listeningListener?: () => void): this;
    listen(path: string, listeningListener?: () => void): this;
    listen(options: ListenOptions, listeningListener?: () => void): this;
    listen(handle: any, backlog?: number, listeningListener?: () => void): this;
    listen(handle: any, listeningListener?: () => void): this;
    close(callback?: (err?: Error) => void): this;
    address(): AddressInfo | string | null;
    getConnections(cb: (error: Error | null, count: number) => void): void;
    ref(): this;
    unref(): this;
    maxConnections: number;
    connections: number;
    listening: boolean;

    /**
     * events.EventEmitter
     *   1. close
     *   2. connection
     *   3. error
     *   4. listening
     */
    addListener(event: string, listener: (...args: any[]) => void): this;
    addListener(event: "close", listener: () => void): this;
    addListener(event: "connection", listener: (socket: Socket) => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "listening", listener: () => void): this;

    emit(event: string | symbol, ...args: any[]): boolean;
    emit(event: "close"): boolean;
    emit(event: "connection", socket: Socket): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "listening"): boolean;

    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "close", listener: () => void): this;
    on(event: "connection", listener: (socket: Socket) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "listening", listener: () => void): this;

    once(event: string, listener: (...args: any[]) => void): this;
    once(event: "close", listener: () => void): this;
    once(event: "connection", listener: (socket: Socket) => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "listening", listener: () => void): this;

    prependListener(event: string, listener: (...args: any[]) => void): this;
    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "connection", listener: (socket: Socket) => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "listening", listener: () => void): this;

    prependOnceListener(event: string, listener: (...args: any[]) => void): this;
    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "connection", listener: (socket: Socket) => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "listening", listener: () => void): this;
}

interface TcpNetConnectOpts extends TcpSocketConnectOpts, SocketConstructorOpts {
    timeout?: number;
}

interface IpcNetConnectOpts extends IpcSocketConnectOpts, SocketConstructorOpts {
    timeout?: number;
}

type NetConnectOpts = TcpNetConnectOpts | IpcNetConnectOpts;

function createServer(connectionListener?: (socket: Socket) => void): Server;
function createServer(options?: { allowHalfOpen?: boolean, pauseOnConnect?: boolean }, connectionListener?: (socket: Socket) => void): Server;
function connect(options: NetConnectOpts, connectionListener?: () => void): Socket;
function connect(port: number, host?: string, connectionListener?: () => void): Socket;
function connect(path: string, connectionListener?: () => void): Socket;
function createConnection(options: NetConnectOpts, connectionListener?: () => void): Socket;
function createConnection(port: number, host?: string, connectionListener?: () => void): Socket;
function createConnection(path: string, connectionListener?: () => void): Socket;
function isIP(input: string): number;
function isIPv4(input: string): boolean;
function isIPv6(input: string): boolean;


interface EventEmitterOptions {
    /**
     * Enables automatic capturing of promise rejection.
     */
    captureRejections?: boolean;
}

interface NodeEventTarget {
    once(event: string | symbol, listener: (...args: any[]) => void): this;
}

interface DOMEventTarget {
    addEventListener(event: string, listener: (...args: any[]) => void, opts?: { once: boolean }): any;
}

declare class EventEmitter {
    constructor(options?: EventEmitterOptions);
    /** @deprecated since v4.0.0 */
    static listenerCount(emitter: EventEmitter, event: string | symbol): number;
    static defaultMaxListeners: number;
    /**
     * This symbol shall be used to install a listener for only monitoring `'error'`
     * events. Listeners installed using this symbol are called before the regular
     * `'error'` listeners are called.
     *
     * Installing a listener using this symbol does not change the behavior once an
     * `'error'` event is emitted, therefore the process will still crash if no
     * regular `'error'` listener is installed.
     */
    static readonly errorMonitor: unique symbol;
    once(emitter: NodeEventTarget, event: string | symbol): Promise<any[]>;
    once(emitter: DOMEventTarget, event: string): Promise<any[]>;
    on(emitter: EventEmitter, event: string): AsyncIterableIterator<any>;
    static captureRejectionSymbol: unique symbol;

    /**
     * This symbol shall be used to install a listener for only monitoring `'error'`
     * events. Listeners installed using this symbol are called before the regular
     * `'error'` listeners are called.
     *
     * Installing a listener using this symbol does not change the behavior once an
     * `'error'` event is emitted, therefore the process will still crash if no
     * regular `'error'` listener is installed.
     */
    const errorMonitor: unique symbol;
    /**
     * Sets or gets the default captureRejection value for all emitters.
     */
    static captureRejections: boolean;
}


interface EventEmitter {
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): Function[];
    rawListeners(event: string | symbol): Function[];
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(type: string | symbol): number;
    // Added in Node 6...
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    eventNames(): Array<string | symbol>;
}
declare namespace FSLibrary {
    /**
     * Valid types for path values in "fs".
     */
    type PathLike = string | Buffer | URL;

    type NoParamCallback = (err: NodeJS.ErrnoException | null) => void;

    type BufferEncodingOption = 'buffer' | { encoding: 'buffer' };

    interface BaseEncodingOptions {
        encoding?: BufferEncoding | null;
    }

    type OpenMode = number | string;

    type Mode = number | string;

    interface StatsBase<T> {
        isFile(): boolean;
        isDirectory(): boolean;
        isBlockDevice(): boolean;
        isCharacterDevice(): boolean;
        isSymbolicLink(): boolean;
        isFIFO(): boolean;
        isSocket(): boolean;

        dev: T;
        ino: T;
        mode: T;
        nlink: T;
        uid: T;
        gid: T;
        rdev: T;
        size: T;
        blksize: T;
        blocks: T;
        atimeMs: T;
        mtimeMs: T;
        ctimeMs: T;
        birthtimeMs: T;
        atime: Date;
        mtime: Date;
        ctime: Date;
        birthtime: Date;
    }

    interface Stats extends StatsBase<number> {
    }

    class Stats {
    }

    class Dirent {
        isFile(): boolean;
        isDirectory(): boolean;
        isBlockDevice(): boolean;
        isCharacterDevice(): boolean;
        isSymbolicLink(): boolean;
        isFIFO(): boolean;
        isSocket(): boolean;
        name: string;
    }

    /**
     * A class representing a directory stream.
     */
    class Dir {
        readonly path: string;

        /**
         * Asynchronously iterates over the directory via `readdir(3)` until all entries have been read.
         */
        [Symbol.asyncIterator](): AsyncIterableIterator<Dirent>;

        /**
         * Asynchronously close the directory's underlying resource handle.
         * Subsequent reads will result in errors.
         */
        close(): Promise<void>;
        close(cb: NoParamCallback): void;

        /**
         * Synchronously close the directory's underlying resource handle.
         * Subsequent reads will result in errors.
         */
        closeSync(): void;

        /**
         * Asynchronously read the next directory entry via `readdir(3)` as an `Dirent`.
         * After the read is completed, a value is returned that will be resolved with an `Dirent`, or `null` if there are no more directory entries to read.
         * Directory entries returned by this function are in no particular order as provided by the operating system's underlying directory mechanisms.
         */
        read(): Promise<Dirent | null>;
        read(cb: (err: NodeJS.ErrnoException | null, dirEnt: Dirent | null) => void): void;

        /**
         * Synchronously read the next directory entry via `readdir(3)` as a `Dirent`.
         * If there are no more directory entries to read, null will be returned.
         * Directory entries returned by this function are in no particular order as provided by the operating system's underlying directory mechanisms.
         */
        readSync(): Dirent;
    }

    interface FSWatcher extends events.EventEmitter {
        close(): void;

        /**
         * events.EventEmitter
         *   1. change
         *   2. error
         */
        addListener(event: string, listener: (...args: any[]) => void): this;
        addListener(event: "change", listener: (eventType: string, filename: string | Buffer) => void): this;
        addListener(event: "error", listener: (error: Error) => void): this;
        addListener(event: "close", listener: () => void): this;

        on(event: string, listener: (...args: any[]) => void): this;
        on(event: "change", listener: (eventType: string, filename: string | Buffer) => void): this;
        on(event: "error", listener: (error: Error) => void): this;
        on(event: "close", listener: () => void): this;

        once(event: string, listener: (...args: any[]) => void): this;
        once(event: "change", listener: (eventType: string, filename: string | Buffer) => void): this;
        once(event: "error", listener: (error: Error) => void): this;
        once(event: "close", listener: () => void): this;

        prependListener(event: string, listener: (...args: any[]) => void): this;
        prependListener(event: "change", listener: (eventType: string, filename: string | Buffer) => void): this;
        prependListener(event: "error", listener: (error: Error) => void): this;
        prependListener(event: "close", listener: () => void): this;

        prependOnceListener(event: string, listener: (...args: any[]) => void): this;
        prependOnceListener(event: "change", listener: (eventType: string, filename: string | Buffer) => void): this;
        prependOnceListener(event: "error", listener: (error: Error) => void): this;
        prependOnceListener(event: "close", listener: () => void): this;
    }

    class ReadStream extends stream.Readable {
        close(): void;
        bytesRead: number;
        path: string | Buffer;
        pending: boolean;

        /**
         * events.EventEmitter
         *   1. open
         *   2. close
         *   3. ready
         */
        addListener(event: "close", listener: () => void): this;
        addListener(event: "data", listener: (chunk: Buffer | string) => void): this;
        addListener(event: "end", listener: () => void): this;
        addListener(event: "error", listener: (err: Error) => void): this;
        addListener(event: "open", listener: (fd: number) => void): this;
        addListener(event: "pause", listener: () => void): this;
        addListener(event: "readable", listener: () => void): this;
        addListener(event: "ready", listener: () => void): this;
        addListener(event: "resume", listener: () => void): this;
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;

        on(event: "close", listener: () => void): this;
        on(event: "data", listener: (chunk: Buffer | string) => void): this;
        on(event: "end", listener: () => void): this;
        on(event: "error", listener: (err: Error) => void): this;
        on(event: "open", listener: (fd: number) => void): this;
        on(event: "pause", listener: () => void): this;
        on(event: "readable", listener: () => void): this;
        on(event: "ready", listener: () => void): this;
        on(event: "resume", listener: () => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;

        once(event: "close", listener: () => void): this;
        once(event: "data", listener: (chunk: Buffer | string) => void): this;
        once(event: "end", listener: () => void): this;
        once(event: "error", listener: (err: Error) => void): this;
        once(event: "open", listener: (fd: number) => void): this;
        once(event: "pause", listener: () => void): this;
        once(event: "readable", listener: () => void): this;
        once(event: "ready", listener: () => void): this;
        once(event: "resume", listener: () => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;

        prependListener(event: "close", listener: () => void): this;
        prependListener(event: "data", listener: (chunk: Buffer | string) => void): this;
        prependListener(event: "end", listener: () => void): this;
        prependListener(event: "error", listener: (err: Error) => void): this;
        prependListener(event: "open", listener: (fd: number) => void): this;
        prependListener(event: "pause", listener: () => void): this;
        prependListener(event: "readable", listener: () => void): this;
        prependListener(event: "ready", listener: () => void): this;
        prependListener(event: "resume", listener: () => void): this;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

        prependOnceListener(event: "close", listener: () => void): this;
        prependOnceListener(event: "data", listener: (chunk: Buffer | string) => void): this;
        prependOnceListener(event: "end", listener: () => void): this;
        prependOnceListener(event: "error", listener: (err: Error) => void): this;
        prependOnceListener(event: "open", listener: (fd: number) => void): this;
        prependOnceListener(event: "pause", listener: () => void): this;
        prependOnceListener(event: "readable", listener: () => void): this;
        prependOnceListener(event: "ready", listener: () => void): this;
        prependOnceListener(event: "resume", listener: () => void): this;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    }

    class WriteStream extends Writable {
        close(): void;
        bytesWritten: number;
        path: string | Buffer;
        pending: boolean;

        /**
         * events.EventEmitter
         *   1. open
         *   2. close
         *   3. ready
         */
        addListener(event: "close", listener: () => void): this;
        addListener(event: "drain", listener: () => void): this;
        addListener(event: "error", listener: (err: Error) => void): this;
        addListener(event: "finish", listener: () => void): this;
        addListener(event: "open", listener: (fd: number) => void): this;
        addListener(event: "pipe", listener: (src: stream.Readable) => void): this;
        addListener(event: "ready", listener: () => void): this;
        addListener(event: "unpipe", listener: (src: stream.Readable) => void): this;
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;

        on(event: "close", listener: () => void): this;
        on(event: "drain", listener: () => void): this;
        on(event: "error", listener: (err: Error) => void): this;
        on(event: "finish", listener: () => void): this;
        on(event: "open", listener: (fd: number) => void): this;
        on(event: "pipe", listener: (src: stream.Readable) => void): this;
        on(event: "ready", listener: () => void): this;
        on(event: "unpipe", listener: (src: stream.Readable) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;

        once(event: "close", listener: () => void): this;
        once(event: "drain", listener: () => void): this;
        once(event: "error", listener: (err: Error) => void): this;
        once(event: "finish", listener: () => void): this;
        once(event: "open", listener: (fd: number) => void): this;
        once(event: "pipe", listener: (src: stream.Readable) => void): this;
        once(event: "ready", listener: () => void): this;
        once(event: "unpipe", listener: (src: stream.Readable) => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;

        prependListener(event: "close", listener: () => void): this;
        prependListener(event: "drain", listener: () => void): this;
        prependListener(event: "error", listener: (err: Error) => void): this;
        prependListener(event: "finish", listener: () => void): this;
        prependListener(event: "open", listener: (fd: number) => void): this;
        prependListener(event: "pipe", listener: (src: stream.Readable) => void): this;
        prependListener(event: "ready", listener: () => void): this;
        prependListener(event: "unpipe", listener: (src: stream.Readable) => void): this;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

        prependOnceListener(event: "close", listener: () => void): this;
        prependOnceListener(event: "drain", listener: () => void): this;
        prependOnceListener(event: "error", listener: (err: Error) => void): this;
        prependOnceListener(event: "finish", listener: () => void): this;
        prependOnceListener(event: "open", listener: (fd: number) => void): this;
        prependOnceListener(event: "pipe", listener: (src: stream.Readable) => void): this;
        prependOnceListener(event: "ready", listener: () => void): this;
        prependOnceListener(event: "unpipe", listener: (src: stream.Readable) => void): this;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    }

    interface RmDirAsyncOptions extends RmDirOptions {
        /**
         * The amount of time in milliseconds to wait between retries.
         * This option is ignored if the `recursive` option is not `true`.
         * @default 100
         */
        retryDelay?: number;
        /**
         * If an `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, or
         * `EPERM` error is encountered, Node.js will retry the operation with a linear
         * backoff wait of `retryDelay` ms longer on each try. This option represents the
         * number of retries. This option is ignored if the `recursive` option is not
         * `true`.
         * @default 0
         */
        maxRetries?: number;
    }

    interface MakeDirectoryOptions {
        /**
         * Indicates whether parent folders should be created.
         * If a folder was created, the path to the first created folder will be returned.
         * @default false
         */
        recursive?: boolean;
        /**
         * A file mode. If a string is passed, it is parsed as an octal integer. If not specified
         * @default 0o777
         */
        mode?: Mode;
    }

    interface ReadSyncOptions {
        /**
         * @default 0
         */
        offset?: number;
        /**
         * @default `length of buffer`
         */
        length?: number;
        /**
         * @default null
         */
        position?: number | null;
    }

    type WriteFileOptions = BaseEncodingOptions & { mode?: Mode; flag?: string; } | string | null;

    namespace constants {
        // File Access Constants

        /** Constant for fs.access(). File is visible to the calling process. */
        const F_OK: number;

        /** Constant for fs.access(). File can be read by the calling process. */
        const R_OK: number;

        /** Constant for fs.access(). File can be written by the calling process. */
        const W_OK: number;

        /** Constant for fs.access(). File can be executed by the calling process. */
        const X_OK: number;

        // File Copy Constants

        /** Constant for fs.copyFile. Flag indicating the destination file should not be overwritten if it already exists. */
        const COPYFILE_EXCL: number;

        /**
         * Constant for fs.copyFile. copy operation will attempt to create a copy-on-write reflink.
         * If the underlying platform does not support copy-on-write, then a fallback copy mechanism is used.
         */
        const COPYFILE_FICLONE: number;

        /**
         * Constant for fs.copyFile. Copy operation will attempt to create a copy-on-write reflink.
         * If the underlying platform does not support copy-on-write, then the operation will fail with an error.
         */
        const COPYFILE_FICLONE_FORCE: number;

        // File Open Constants

        /** Constant for fs.open(). Flag indicating to open a file for read-only access. */
        const O_RDONLY: number;

        /** Constant for fs.open(). Flag indicating to open a file for write-only access. */
        const O_WRONLY: number;

        /** Constant for fs.open(). Flag indicating to open a file for read-write access. */
        const O_RDWR: number;

        /** Constant for fs.open(). Flag indicating to create the file if it does not already exist. */
        const O_CREAT: number;

        /** Constant for fs.open(). Flag indicating that opening a file should fail if the O_CREAT flag is set and the file already exists. */
        const O_EXCL: number;

        /**
         * Constant for fs.open(). Flag indicating that if path identifies a terminal device,
         * opening the path shall not cause that terminal to become the controlling terminal for the process
         * (if the process does not already have one).
         */
        const O_NOCTTY: number;

        /** Constant for fs.open(). Flag indicating that if the file exists and is a regular file, and the file is opened successfully for write access, its length shall be truncated to zero. */
        const O_TRUNC: number;

        /** Constant for fs.open(). Flag indicating that data will be appended to the end of the file. */
        const O_APPEND: number;

        /** Constant for fs.open(). Flag indicating that the open should fail if the path is not a directory. */
        const O_DIRECTORY: number;

        /**
         * constant for fs.open().
         * Flag indicating reading accesses to the file system will no longer result in
         * an update to the atime information associated with the file.
         * This flag is available on Linux operating systems only.
         */
        const O_NOATIME: number;

        /** Constant for fs.open(). Flag indicating that the open should fail if the path is a symbolic link. */
        const O_NOFOLLOW: number;

        /** Constant for fs.open(). Flag indicating that the file is opened for synchronous I/O. */
        const O_SYNC: number;

        /** Constant for fs.open(). Flag indicating that the file is opened for synchronous I/O with write operations waiting for data integrity. */
        const O_DSYNC: number;

        /** Constant for fs.open(). Flag indicating to open the symbolic link itself rather than the resource it is pointing to. */
        const O_SYMLINK: number;

        /** Constant for fs.open(). When set, an attempt will be made to minimize caching effects of file I/O. */
        const O_DIRECT: number;

        /** Constant for fs.open(). Flag indicating to open the file in nonblocking mode when possible. */
        const O_NONBLOCK: number;

        // File Type Constants

        /** Constant for fs.Stats mode property for determining a file's type. Bit mask used to extract the file type code. */
        const S_IFMT: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a regular file. */
        const S_IFREG: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a directory. */
        const S_IFDIR: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a character-oriented device file. */
        const S_IFCHR: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a block-oriented device file. */
        const S_IFBLK: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a FIFO/pipe. */
        const S_IFIFO: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a symbolic link. */
        const S_IFLNK: number;

        /** Constant for fs.Stats mode property for determining a file's type. File type constant for a socket. */
        const S_IFSOCK: number;

        // File Mode Constants

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating readable, writable and executable by owner. */
        const S_IRWXU: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating readable by owner. */
        const S_IRUSR: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating writable by owner. */
        const S_IWUSR: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating executable by owner. */
        const S_IXUSR: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating readable, writable and executable by group. */
        const S_IRWXG: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating readable by group. */
        const S_IRGRP: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating writable by group. */
        const S_IWGRP: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating executable by group. */
        const S_IXGRP: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating readable, writable and executable by others. */
        const S_IRWXO: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating readable by others. */
        const S_IROTH: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating writable by others. */
        const S_IWOTH: number;

        /** Constant for fs.Stats mode property for determining access permissions for a file. File mode indicating executable by others. */
        const S_IXOTH: number;

        /**
         * When set, a memory file mapping is used to access the file. This flag
         * is available on Windows operating systems only. On other operating systems,
         * this flag is ignored.
         */
        const UV_FS_O_FILEMAP: number;
    }

    interface WriteVResult {
        bytesWritten: number;
        buffers: NodeJS.ArrayBufferView[];
    }

    interface ReadVResult {
        bytesRead: number;
        buffers: NodeJS.ArrayBufferView[];
    }

    interface OpenDirOptions {
        encoding?: BufferEncoding;
        /**
         * Number of directory entries that are buffered
         * internally when reading from the directory. Higher values lead to better
         * performance but higher memory usage.
         * @default 32
         */
        bufferSize?: number;
    }
}



























declare interface FSLibrary {
    /**
     * Asynchronous rename(2) - Change the name or location of a file or directory.
     * @param oldPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * @param newPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    rename(oldPath: PathLike, newPath: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronous rename(2) - Change the name or location of a file or directory.
     * @param oldPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * @param newPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    renameSync(oldPath: PathLike, newPath: PathLike): void;

    /**
     * Asynchronous truncate(2) - Truncate a file to a specified length.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param len If not specified, defaults to `0`.
     */
    truncate(path: PathLike, len: number | undefined | null, callback: NoParamCallback): void;

    /**
     * Asynchronous truncate(2) - Truncate a file to a specified length.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    truncate(path: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronous truncate(2) - Truncate a file to a specified length.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param len If not specified, defaults to `0`.
     */
    truncateSync(path: PathLike, len?: number | null): void;

    /**
     * Asynchronous ftruncate(2) - Truncate a file to a specified length.
     * @param fd A file descriptor.
     * @param len If not specified, defaults to `0`.
     */
    ftruncate(fd: number, len: number | undefined | null, callback: NoParamCallback): void;

    /**
     * Asynchronous ftruncate(2) - Truncate a file to a specified length.
     * @param fd A file descriptor.
     */
    ftruncate(fd: number, callback: NoParamCallback): void;

    /**
     * Synchronous ftruncate(2) - Truncate a file to a specified length.
     * @param fd A file descriptor.
     * @param len If not specified, defaults to `0`.
     */
    ftruncateSync(fd: number, len?: number | null): void;

    /**
     * Asynchronous chown(2) - Change ownership of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    chown(path: PathLike, uid: number, gid: number, callback: NoParamCallback): void;

    /**
     * Synchronous chown(2) - Change ownership of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    chownSync(path: PathLike, uid: number, gid: number): void;

    /**
     * Asynchronous fchown(2) - Change ownership of a file.
     * @param fd A file descriptor.
     */
    fchown(fd: number, uid: number, gid: number, callback: NoParamCallback): void;

    /**
     * Synchronous fchown(2) - Change ownership of a file.
     * @param fd A file descriptor.
     */
    fchownSync(fd: number, uid: number, gid: number): void;

    /**
     * Asynchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    lchown(path: PathLike, uid: number, gid: number, callback: NoParamCallback): void;

    /**
     * Synchronous lchown(2) - Change ownership of a file. Does not dereference symbolic links.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    lchownSync(path: PathLike, uid: number, gid: number): void;

    /**
     * Asynchronous chmod(2) - Change permissions of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    chmod(path: PathLike, mode: Mode, callback: NoParamCallback): void;

    /**
     * Synchronous chmod(2) - Change permissions of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    chmodSync(path: PathLike, mode: Mode): void;

    /**
     * Asynchronous fchmod(2) - Change permissions of a file.
     * @param fd A file descriptor.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    fchmod(fd: number, mode: Mode, callback: NoParamCallback): void;

    /**
     * Synchronous fchmod(2) - Change permissions of a file.
     * @param fd A file descriptor.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    fchmodSync(fd: number, mode: Mode): void;

    /**
     * Asynchronous lchmod(2) - Change permissions of a file. Does not dereference symbolic links.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    lchmod(path: PathLike, mode: Mode, callback: NoParamCallback): void;

    /**
     * Synchronous lchmod(2) - Change permissions of a file. Does not dereference symbolic links.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    lchmodSync(path: PathLike, mode: Mode): void;

    /**
     * Asynchronous stat(2) - Get file status.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    stat(path: PathLike, callback: (err: NodeJS.ErrnoException | null, stats: FSLibrary.Stats) => void): void;

    /**
     * Synchronous stat(2) - Get file status.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    statSync(path: PathLike): FSLibrary.Stats;

    /**
     * Asynchronous fstat(2) - Get file status.
     * @param fd A file descriptor.
     */
    fstat(fd: number, callback: (err: NodeJS.ErrnoException | null, stats: FSLibrary.Stats) => void): void;

    /**
     * Synchronous fstat(2) - Get file status.
     * @param fd A file descriptor.
     */
    fstatSync(fd: number): FSLibrary.Stats;

    /**
     * Asynchronous lstat(2) - Get file status. Does not dereference symbolic links.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    lstat(path: PathLike, callback: (err: NodeJS.ErrnoException | null, stats: FSLibrary.Stats) => void): void;

    /**
     * Synchronous lstat(2) - Get file status. Does not dereference symbolic links.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    lstatSync(path: PathLike): FSLibrary.Stats;

    /**
     * Asynchronous link(2) - Create a new link (also known as a hard link) to an existing file.
     * @param existingPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param newPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    link(existingPath: PathLike, newPath: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronous link(2) - Create a new link (also known as a hard link) to an existing file.
     * @param existingPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param newPath A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    linkSync(existingPath: PathLike, newPath: PathLike): void;

    /**
     * Asynchronous symlink(2) - Create a new symbolic link to an existing file.
     * @param target A path to an existing file. If a URL is provided, it must use the `file:` protocol.
     * @param path A path to the new symlink. If a URL is provided, it must use the `file:` protocol.
     * @param type May be set to `'dir'`, `'file'`, or `'junction'` (default is `'file'`) and is only available on Windows (ignored on other platforms).
     * When using `'junction'`, the `target` argument will automatically be normalized to an absolute path.
     */
    symlink(target: PathLike, path: PathLike, type: symlink.Type | undefined | null, callback: NoParamCallback): void;

    /**
     * Asynchronous symlink(2) - Create a new symbolic link to an existing file.
     * @param target A path to an existing file. If a URL is provided, it must use the `file:` protocol.
     * @param path A path to the new symlink. If a URL is provided, it must use the `file:` protocol.
     */
    symlink(target: PathLike, path: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronous symlink(2) - Create a new symbolic link to an existing file.
     * @param target A path to an existing file. If a URL is provided, it must use the `file:` protocol.
     * @param path A path to the new symlink. If a URL is provided, it must use the `file:` protocol.
     * @param type May be set to `'dir'`, `'file'`, or `'junction'` (default is `'file'`) and is only available on Windows (ignored on other platforms).
     * When using `'junction'`, the `target` argument will automatically be normalized to an absolute path.
     */
    symlinkSync(target: PathLike, path: PathLike, type?: symlink.Type | null): void;

    /**
     * Asynchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readlink(
        path: PathLike,
        options: BaseEncodingOptions | BufferEncoding | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, linkString: string) => void
    ): void;

    /**
     * Asynchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readlink(path: PathLike, options: BufferEncodingOption, callback: (err: NodeJS.ErrnoException | null, linkString: Buffer) => void): void;

    /**
     * Asynchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readlink(path: PathLike, options: BaseEncodingOptions | string | undefined | null, callback: (err: NodeJS.ErrnoException | null, linkString: string | Buffer) => void): void;

    /**
     * Asynchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    readlink(path: PathLike, callback: (err: NodeJS.ErrnoException | null, linkString: string) => void): void;

    /**
     * Synchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readlinkSync(path: PathLike, options?: BaseEncodingOptions | BufferEncoding | null): string;

    /**
     * Synchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readlinkSync(path: PathLike, options: BufferEncodingOption): Buffer;

    /**
     * Synchronous readlink(2) - read value of a symbolic link.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readlinkSync(path: PathLike, options?: BaseEncodingOptions | string | null): string | Buffer;

    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    realpath(
        path: PathLike,
        options: BaseEncodingOptions | BufferEncoding | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, resolvedPath: string) => void
    ): void;

    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    realpath(path: PathLike, options: BufferEncodingOption, callback: (err: NodeJS.ErrnoException | null, resolvedPath: Buffer) => void): void;

    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    realpath(path: PathLike, options: BaseEncodingOptions | string | undefined | null, callback: (err: NodeJS.ErrnoException | null, resolvedPath: string | Buffer) => void): void;

    /**
     * Asynchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    realpath(path: PathLike, callback: (err: NodeJS.ErrnoException | null, resolvedPath: string) => void): void;

    /**
     * Synchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    realpathSync(path: PathLike, options?: BaseEncodingOptions | BufferEncoding | null): string;

    /**
     * Synchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    realpathSync(path: PathLike, options: BufferEncodingOption): Buffer;

    /**
     * Synchronous realpath(3) - return the canonicalized absolute pathname.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    realpathSync(path: PathLike, options?: BaseEncodingOptions | string | null): string | Buffer;

    /**
     * Asynchronous unlink(2) - delete a name and possibly the file it refers to.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    unlink(path: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronous unlink(2) - delete a name and possibly the file it refers to.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    unlinkSync(path: PathLike): void;



    /**
     * Asynchronous rmdir(2) - delete a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    rmdir(path: PathLike, callback: NoParamCallback): void;
    rmdir(path: PathLike, options: RmDirAsyncOptions, callback: NoParamCallback): void;

    /**
     * Synchronous rmdir(2) - delete a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    rmdirSync(path: PathLike, options?: RmDirOptions): void;



    /**
     * Asynchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    mkdir(path: PathLike, options: MakeDirectoryOptions & { recursive: true }, callback: (err: NodeJS.ErrnoException | null, path: string) => void): void;

    /**
     * Asynchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    mkdir(path: PathLike, options: Mode | (MakeDirectoryOptions & { recursive?: false; }) | null | undefined, callback: NoParamCallback): void;

    /**
     * Asynchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    mkdir(path: PathLike, options: Mode | MakeDirectoryOptions | null | undefined, callback: (err: NodeJS.ErrnoException | null, path: string | undefined) => void): void;

    /**
     * Asynchronous mkdir(2) - create a directory with a mode of `0o777`.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    mkdir(path: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    mkdirSync(path: PathLike, options: MakeDirectoryOptions & { recursive: true; }): string;

    /**
     * Synchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    mkdirSync(path: PathLike, options?: Mode | (MakeDirectoryOptions & { recursive?: false; }) | null): void;

    /**
     * Synchronous mkdir(2) - create a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options Either the file mode, or an object optionally specifying the file mode and whether parent folders
     * should be created. If a string is passed, it is parsed as an octal integer. If not specified, defaults to `0o777`.
     */
    mkdirSync(path: PathLike, options?: Mode | MakeDirectoryOptions | null): string | undefined;

    /**
     * Asynchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    mkdtemp(prefix: string, options: BaseEncodingOptions | BufferEncoding | undefined | null, callback: (err: NodeJS.ErrnoException | null, folder: string) => void): void;

    /**
     * Asynchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    mkdtemp(prefix: string, options: "buffer" | { encoding: "buffer" }, callback: (err: NodeJS.ErrnoException | null, folder: Buffer) => void): void;

    /**
     * Asynchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    mkdtemp(prefix: string, options: BaseEncodingOptions | string | undefined | null, callback: (err: NodeJS.ErrnoException | null, folder: string | Buffer) => void): void;

    /**
     * Asynchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     */
    mkdtemp(prefix: string, callback: (err: NodeJS.ErrnoException | null, folder: string) => void): void;

    /**
     * Synchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    mkdtempSync(prefix: string, options?: BaseEncodingOptions | BufferEncoding | null): string;

    /**
     * Synchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    mkdtempSync(prefix: string, options: BufferEncodingOption): Buffer;

    /**
     * Synchronously creates a unique temporary directory.
     * Generates six random characters to be appended behind a required prefix to create a unique temporary directory.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    mkdtempSync(prefix: string, options?: BaseEncodingOptions | string | null): string | Buffer;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdir(
        path: PathLike,
        options: { encoding: BufferEncoding | null; withFileTypes?: false } | BufferEncoding | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, files: string[]) => void,
    ): void;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdir(path: PathLike, options: { encoding: "buffer"; withFileTypes?: false } | "buffer", callback: (err: NodeJS.ErrnoException | null, files: Buffer[]) => void): void;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdir(
        path: PathLike,
        options: BaseEncodingOptions & { withFileTypes?: false } | BufferEncoding | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, files: string[] | Buffer[]) => void,
    ): void;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    readdir(path: PathLike, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void): void;

    /**
     * Asynchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options If called with `withFileTypes: true` the result data will be an array of Dirent.
     */
    readdir(path: PathLike, options: BaseEncodingOptions & { withFileTypes: true }, callback: (err: NodeJS.ErrnoException | null, files: Dirent[]) => void): void;

    /**
     * Synchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdirSync(path: PathLike, options?: { encoding: BufferEncoding | null; withFileTypes?: false } | BufferEncoding | null): string[];

    /**
     * Synchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdirSync(path: PathLike, options: { encoding: "buffer"; withFileTypes?: false } | "buffer"): Buffer[];

    /**
     * Synchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options The encoding (or an object specifying the encoding), used as the encoding of the result. If not provided, `'utf8'` is used.
     */
    readdirSync(path: PathLike, options?: BaseEncodingOptions & { withFileTypes?: false } | BufferEncoding | null): string[] | Buffer[];

    /**
     * Synchronous readdir(3) - read a directory.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param options If called with `withFileTypes: true` the result data will be an array of Dirent.
     */
    readdirSync(path: PathLike, options: BaseEncodingOptions & { withFileTypes: true }): Dirent[];

    /**
     * Asynchronous close(2) - close a file descriptor.
     * @param fd A file descriptor.
     */
    close(fd: number, callback: NoParamCallback): void;

    /**
     * Synchronous close(2) - close a file descriptor.
     * @param fd A file descriptor.
     */
    closeSync(fd: number): void;

    /**
     * Asynchronous open(2) - open and possibly create a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer. If not supplied, defaults to `0o666`.
     */
    open(path: PathLike, flags: OpenMode, mode: Mode | undefined | null, callback: (err: NodeJS.ErrnoException | null, fd: number) => void): void;

    /**
     * Asynchronous open(2) - open and possibly create a file. If the file is created, its mode will be `0o666`.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     */
    open(path: PathLike, flags: OpenMode, callback: (err: NodeJS.ErrnoException | null, fd: number) => void): void;

    /**
     * Synchronous open(2) - open and possibly create a file, returning a file descriptor..
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer. If not supplied, defaults to `0o666`.
     */
    openSync(path: PathLike, flags: OpenMode, mode?: Mode | null): number;

    /**
     * Asynchronously change file timestamps of the file referenced by the supplied path.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param atime The last access time. If a string is provided, it will be coerced to number.
     * @param mtime The last modified time. If a string is provided, it will be coerced to number.
     */
    utimes(path: PathLike, atime: string | number | Date, mtime: string | number | Date, callback: NoParamCallback): void;

    /**
     * Synchronously change file timestamps of the file referenced by the supplied path.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * @param atime The last access time. If a string is provided, it will be coerced to number.
     * @param mtime The last modified time. If a string is provided, it will be coerced to number.
     */
    utimesSync(path: PathLike, atime: string | number | Date, mtime: string | number | Date): void;

    /**
     * Asynchronously change file timestamps of the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param atime The last access time. If a string is provided, it will be coerced to number.
     * @param mtime The last modified time. If a string is provided, it will be coerced to number.
     */
    futimes(fd: number, atime: string | number | Date, mtime: string | number | Date, callback: NoParamCallback): void;

    /**
     * Synchronously change file timestamps of the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param atime The last access time. If a string is provided, it will be coerced to number.
     * @param mtime The last modified time. If a string is provided, it will be coerced to number.
     */
    futimesSync(fd: number, atime: string | number | Date, mtime: string | number | Date): void;

    /**
     * Asynchronous fsync(2) - synchronize a file's in-core state with the underlying storage device.
     * @param fd A file descriptor.
     */
    fsync(fd: number, callback: NoParamCallback): void;

    /**
     * Synchronous fsync(2) - synchronize a file's in-core state with the underlying storage device.
     * @param fd A file descriptor.
     */
    fsyncSync(fd: number): void;

    /**
     * Asynchronously writes `buffer` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param offset The part of the buffer to be written. If not supplied, defaults to `0`.
     * @param length The number of bytes to write. If not supplied, defaults to `buffer.length - offset`.
     * @param position The offset from the beginning of the file where this data should be written. If not supplied, defaults to the current position.
     */
    write<TBuffer extends NodeJS.ArrayBufferView>(
        fd: number,
        buffer: TBuffer,
        offset: number | undefined | null,
        length: number | undefined | null,
        position: number | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, written: number, buffer: TBuffer) => void,
    ): void;

    /**
     * Asynchronously writes `buffer` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param offset The part of the buffer to be written. If not supplied, defaults to `0`.
     * @param length The number of bytes to write. If not supplied, defaults to `buffer.length - offset`.
     */
    write<TBuffer extends NodeJS.ArrayBufferView>(
        fd: number,
        buffer: TBuffer,
        offset: number | undefined | null,
        length: number | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, written: number, buffer: TBuffer) => void,
    ): void;

    /**
     * Asynchronously writes `buffer` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param offset The part of the buffer to be written. If not supplied, defaults to `0`.
     */
    write<TBuffer extends NodeJS.ArrayBufferView>(
        fd: number,
        buffer: TBuffer,
        offset: number | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, written: number, buffer: TBuffer) => void
    ): void;

    /**
     * Asynchronously writes `buffer` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     */
    write<TBuffer extends NodeJS.ArrayBufferView>(fd: number, buffer: TBuffer, callback: (err: NodeJS.ErrnoException | null, written: number, buffer: TBuffer) => void): void;

    /**
     * Asynchronously writes `string` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param string A string to write.
     * @param position The offset from the beginning of the file where this data should be written. If not supplied, defaults to the current position.
     * @param encoding The expected string encoding.
     */
    write(
        fd: number,
        string: string,
        position: number | undefined | null,
        encoding: BufferEncoding | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, written: number, str: string) => void,
    ): void;

    /**
     * Asynchronously writes `string` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param string A string to write.
     * @param position The offset from the beginning of the file where this data should be written. If not supplied, defaults to the current position.
     */
    write(fd: number, string: string, position: number | undefined | null, callback: (err: NodeJS.ErrnoException | null, written: number, str: string) => void): void;

    /**
     * Asynchronously writes `string` to the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param string A string to write.
     */
    write(fd: number, string: string, callback: (err: NodeJS.ErrnoException | null, written: number, str: string) => void): void;

    /**
     * Synchronously writes `buffer` to the file referenced by the supplied file descriptor, returning the number of bytes written.
     * @param fd A file descriptor.
     * @param offset The part of the buffer to be written. If not supplied, defaults to `0`.
     * @param length The number of bytes to write. If not supplied, defaults to `buffer.length - offset`.
     * @param position The offset from the beginning of the file where this data should be written. If not supplied, defaults to the current position.
     */
    writeSync(fd: number, buffer: NodeJS.ArrayBufferView, offset?: number | null, length?: number | null, position?: number | null): number;

    /**
     * Synchronously writes `string` to the file referenced by the supplied file descriptor, returning the number of bytes written.
     * @param fd A file descriptor.
     * @param string A string to write.
     * @param position The offset from the beginning of the file where this data should be written. If not supplied, defaults to the current position.
     * @param encoding The expected string encoding.
     */
    writeSync(fd: number, string: string, position?: number | null, encoding?: BufferEncoding | null): number;

    /**
     * Asynchronously reads data from the file referenced by the supplied file descriptor.
     * @param fd A file descriptor.
     * @param buffer The buffer that the data will be written to.
     * @param offset The offset in the buffer at which to start writing.
     * @param length The number of bytes to read.
     * @param position The offset from the beginning of the file from which data should be read. If `null`, data will be read from the current position.
     */
    read<TBuffer extends NodeJS.ArrayBufferView>(
        fd: number,
        buffer: TBuffer,
        offset: number,
        length: number,
        position: number | null,
        callback: (err: NodeJS.ErrnoException | null, bytesRead: number, buffer: TBuffer) => void,
    ): void;

    /**
     * Synchronously reads data from the file referenced by the supplied file descriptor, returning the number of bytes read.
     * @param fd A file descriptor.
     * @param buffer The buffer that the data will be written to.
     * @param offset The offset in the buffer at which to start writing.
     * @param length The number of bytes to read.
     * @param position The offset from the beginning of the file from which data should be read. If `null`, data will be read from the current position.
     */
    readSync(fd: number, buffer: NodeJS.ArrayBufferView, offset: number, length: number, position: number | null): number;

    /**
     * Similar to the above `fs.readSync` function, this version takes an optional `options` object.
     * If no `options` object is specified, it will default with the above values.
     */
    readSync(fd: number, buffer: NodeJS.ArrayBufferView, opts?: ReadSyncOptions): number;

    /**
     * Asynchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param options An object that may contain an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    readFile(path: PathLike | number, options: { encoding?: null; flag?: string; } | undefined | null, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void): void;

    /**
     * Asynchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param options Either the encoding for the result, or an object that contains the encoding and an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    readFile(path: PathLike | number, options: { encoding: BufferEncoding; flag?: string; } | string, callback: (err: NodeJS.ErrnoException | null, data: string) => void): void;

    /**
     * Asynchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param options Either the encoding for the result, or an object that contains the encoding and an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    readFile(
        path: PathLike | number,
        options: BaseEncodingOptions & { flag?: string; } | string | undefined | null,
        callback: (err: NodeJS.ErrnoException | null, data: string | Buffer) => void,
    ): void;

    /**
     * Asynchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     */
    readFile(path: PathLike | number, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void): void;

    /**
     * Synchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param options An object that may contain an optional flag. If a flag is not provided, it defaults to `'r'`.
     */
    readFileSync(path: PathLike | number, options?: { encoding?: null; flag?: string; } | null): Buffer;

    /**
     * Synchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param options Either the encoding for the result, or an object that contains the encoding and an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    readFileSync(path: PathLike | number, options: { encoding: BufferEncoding; flag?: string; } | BufferEncoding): string;

    /**
     * Synchronously reads the entire contents of a file.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param options Either the encoding for the result, or an object that contains the encoding and an optional flag.
     * If a flag is not provided, it defaults to `'r'`.
     */
    readFileSync(path: PathLike | number, options?: BaseEncodingOptions & { flag?: string; } | BufferEncoding | null): string | Buffer;

    /**
     * Asynchronously writes data to a file, replacing the file if it already exists.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
     * @param options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `mode` is not supplied, the default of `0o666` is used.
     * If `mode` is a string, it is parsed as an octal integer.
     * If `flag` is not supplied, the default of `'w'` is used.
     */
    writeFile(path: PathLike | number, data: string | NodeJS.ArrayBufferView, options: WriteFileOptions, callback: NoParamCallback): void;

    /**
     * Asynchronously writes data to a file, replacing the file if it already exists.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
     */
    writeFile(path: PathLike | number, data: string | NodeJS.ArrayBufferView, callback: NoParamCallback): void;

    /**
     * Synchronously writes data to a file, replacing the file if it already exists.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
     * @param options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `mode` is not supplied, the default of `0o666` is used.
     * If `mode` is a string, it is parsed as an octal integer.
     * If `flag` is not supplied, the default of `'w'` is used.
     */
    writeFileSync(path: PathLike | number, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): void;

    /**
     * Asynchronously append data to a file, creating the file if it does not exist.
     * @param file A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
     * @param options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `mode` is not supplied, the default of `0o666` is used.
     * If `mode` is a string, it is parsed as an octal integer.
     * If `flag` is not supplied, the default of `'a'` is used.
     */
    appendFile(file: PathLike | number, data: string | Uint8Array, options: WriteFileOptions, callback: NoParamCallback): void;

    /**
     * Asynchronously append data to a file, creating the file if it does not exist.
     * @param file A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
     */
    appendFile(file: PathLike | number, data: string | Uint8Array, callback: NoParamCallback): void;

    /**
     * Synchronously append data to a file, creating the file if it does not exist.
     * @param file A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * If a file descriptor is provided, the underlying file will _not_ be closed automatically.
     * @param data The data to write. If something other than a Buffer or Uint8Array is provided, the value is coerced to a string.
     * @param options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `mode` is not supplied, the default of `0o666` is used.
     * If `mode` is a string, it is parsed as an octal integer.
     * If `flag` is not supplied, the default of `'a'` is used.
     */
    appendFileSync(file: PathLike | number, data: string | Uint8Array, options?: WriteFileOptions): void;

    /**
     * Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.
     */
    watchFile(filename: PathLike, options: { persistent?: boolean; interval?: number; } | undefined, listener: (curr: FSLibrary.Stats, prev: FSLibrary.Stats) => void): void;

    /**
     * Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    watchFile(filename: PathLike, listener: (curr: FSLibrary.Stats, prev: FSLibrary.Stats) => void): void;

    /**
     * Stop watching for changes on `filename`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    unwatchFile(filename: PathLike, listener?: (curr: FSLibrary.Stats, prev: FSLibrary.Stats) => void): void;

    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    watch(
        filename: PathLike,
        options: { encoding?: BufferEncoding | null, persistent?: boolean, recursive?: boolean } | BufferEncoding | undefined | null,
        listener?: (event: string, filename: string) => void,
    ): FSWatcher;

    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    watch(filename: PathLike, options: { encoding: "buffer", persistent?: boolean, recursive?: boolean } | "buffer", listener?: (event: string, filename: Buffer) => void): FSWatcher;

    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     * @param options Either the encoding for the filename provided to the listener, or an object optionally specifying encoding, persistent, and recursive options.
     * If `encoding` is not supplied, the default of `'utf8'` is used.
     * If `persistent` is not supplied, the default of `true` is used.
     * If `recursive` is not supplied, the default of `false` is used.
     */
    watch(
        filename: PathLike,
        options: { encoding?: BufferEncoding | null, persistent?: boolean, recursive?: boolean } | string | null,
        listener?: (event: string, filename: string | Buffer) => void,
    ): FSWatcher;

    /**
     * Watch for changes on `filename`, where `filename` is either a file or a directory, returning an `FSWatcher`.
     * @param filename A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    watch(filename: PathLike, listener?: (event: string, filename: string) => any): FSWatcher;

    /**
     * Asynchronously tests whether or not the given path exists by checking with the file system.
     * @deprecated since v1.0.0 Use `fs.stat()` or `fs.access()` instead
     * @param path A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    exists(path: PathLike, callback: (exists: boolean) => void): void;

    /**
     * Synchronously tests whether or not the given path exists by checking with the file system.
     * @param path A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    existsSync(path: PathLike): boolean;

    /**
     * Asynchronously tests a user's permissions for the file specified by path.
     * @param path A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    access(path: PathLike, mode: number | undefined, callback: NoParamCallback): void;

    /**
     * Asynchronously tests a user's permissions for the file specified by path.
     * @param path A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    access(path: PathLike, callback: NoParamCallback): void;

    /**
     * Synchronously tests a user's permissions for the file specified by path.
     * @param path A path to a file or directory. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    accessSync(path: PathLike, mode?: number): void;

    /**
     * Returns a new `ReadStream` object.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    createReadStream(path: PathLike, options?: string | {
        flags?: string;
        encoding?: BufferEncoding;
        fd?: number;
        mode?: number;
        autoClose?: boolean;
        /**
         * @default false
         */
        emitClose?: boolean;
        start?: number;
        end?: number;
        highWaterMark?: number;
    }): ReadStream;

    /**
     * Returns a new `WriteStream` object.
     * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
     * URL support is _experimental_.
     */
    createWriteStream(path: PathLike, options?: string | {
        flags?: string;
        encoding?: BufferEncoding;
        fd?: number;
        mode?: number;
        autoClose?: boolean;
        emitClose?: boolean;
        start?: number;
        highWaterMark?: number;
    }): WriteStream;

    /**
     * Asynchronous fdatasync(2) - synchronize a file's in-core state with storage device.
     * @param fd A file descriptor.
     */
    fdatasync(fd: number, callback: NoParamCallback): void;

    /**
     * Synchronous fdatasync(2) - synchronize a file's in-core state with storage device.
     * @param fd A file descriptor.
     */
    fdatasyncSync(fd: number): void;

    /**
     * Asynchronously copies src to dest. By default, dest is overwritten if it already exists.
     * No arguments other than a possible exception are given to the callback function.
     * Node.js makes no guarantees about the atomicity of the copy operation.
     * If an error occurs after the destination file has been opened for writing, Node.js will attempt
     * to remove the destination.
     * @param src A path to the source file.
     * @param dest A path to the destination file.
     */
    copyFile(src: PathLike, dest: PathLike, callback: NoParamCallback): void;
    /**
     * Asynchronously copies src to dest. By default, dest is overwritten if it already exists.
     * No arguments other than a possible exception are given to the callback function.
     * Node.js makes no guarantees about the atomicity of the copy operation.
     * If an error occurs after the destination file has been opened for writing, Node.js will attempt
     * to remove the destination.
     * @param src A path to the source file.
     * @param dest A path to the destination file.
     * @param flags An integer that specifies the behavior of the copy operation. The only supported flag is fs.constants.COPYFILE_EXCL, which causes the copy operation to fail if dest already exists.
     */
    copyFile(src: PathLike, dest: PathLike, flags: number, callback: NoParamCallback): void;

    /**
     * Synchronously copies src to dest. By default, dest is overwritten if it already exists.
     * Node.js makes no guarantees about the atomicity of the copy operation.
     * If an error occurs after the destination file has been opened for writing, Node.js will attempt
     * to remove the destination.
     * @param src A path to the source file.
     * @param dest A path to the destination file.
     * @param flags An optional integer that specifies the behavior of the copy operation.
     * The only supported flag is fs.constants.COPYFILE_EXCL, which causes the copy operation to fail if dest already exists.
     */
    copyFileSync(src: PathLike, dest: PathLike, flags?: number): void;

    /**
     * Write an array of ArrayBufferViews to the file specified by fd using writev().
     * position is the offset from the beginning of the file where this data should be written.
     * It is unsafe to use fs.writev() multiple times on the same file without waiting for the callback. For this scenario, use fs.createWriteStream().
     * On Linux, positional writes don't work when the file is opened in append mode.
     * The kernel ignores the position argument and always appends the data to the end of the file.
     */
    writev(
        fd: number,
        buffers: NodeJS.ArrayBufferView[],
        cb: (err: NodeJS.ErrnoException | null, bytesWritten: number, buffers: NodeJS.ArrayBufferView[]) => void
    ): void;
    writev(
        fd: number,
        buffers: NodeJS.ArrayBufferView[],
        position: number,
        cb: (err: NodeJS.ErrnoException | null, bytesWritten: number, buffers: NodeJS.ArrayBufferView[]) => void
    ): void;

    /**
     * See `writev`.
     */
    writevSync(fd: number, buffers: NodeJS.ArrayBufferView[], position?: number): number;

    readv(
        fd: number,
        buffers: NodeJS.ArrayBufferView[],
        cb: (err: NodeJS.ErrnoException | null, bytesRead: number, buffers: NodeJS.ArrayBufferView[]) => void
    ): void;
    readv(
        fd: number,
        buffers: NodeJS.ArrayBufferView[],
        position: number,
        cb: (err: NodeJS.ErrnoException | null, bytesRead: number, buffers: NodeJS.ArrayBufferView[]) => void
    ): void;

    /**
     * See `readv`.
     */
    readvSync(fd: number, buffers: NodeJS.ArrayBufferView[], position?: number): number;

    opendirSync(path: string, options?: OpenDirOptions): Dir;

    opendir(path: string, cb: (err: NodeJS.ErrnoException | null, dir: Dir) => void): void;
    opendir(path: string, options: OpenDirOptions, cb: (err: NodeJS.ErrnoException | null, dir: Dir) => void): void;
}
    function SGAppsServer(): SGAppsServer;
    function LoggerBuilder(): LoggerBuilder;
}declare namespace SGAppsServer {
    namespace NodeJsMvc {
        namespace Controller {
            type View = {
                name: string;
                path: string;
                code: string;
            };
            type View = {
                name: string;
                path: string;
                code: string;
            };
            namespace Action {
                type OptionCapture = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, controller: SGAppsServer.NodeJsMvc.Controller, action: SGAppsServer.NodeJsMvc.Controller.Action) => void;
                type Options = {
                    public: boolean;
                    postData: boolean;
                    maxPostSize: number;
                    capture?: SGAppsServer.NodeJsMvc.Controller.Action.OptionCapture;
                };
            }
            class Action {
                constructor(actionName: string, controller: SGAppsServer.NodeJsMvc.Controller, options: SGAppsServer.NodeJsMvc.Controller.Action.Options, server: SGAppsServer);
                controller: SGAppsServer.NodeJsMvc.Controller;
                name: string;
                run(request: SGAppsServerRequest, response: SGAppsServerResponse): void;
                public: boolean;
                postData: boolean;
                maxPostSize: number;
            }
        }
        class Controller {
            constructor(controllerName: string, options: {
                shared?: any;
            }, server: SGAppsServer);
            _actions: {
                [key: string]: SGAppsServer.NodeJsMvc.Controller.Action;
            };
            _views: {
                [key: string]: SGAppsServer.NodeJsMvc.Controller.View;
            };
            viewer: TemplateManagerViewer;
            name: string;
            getView(viewName: string): SGAppsServer.NodeJsMvc.Controller.View;
            viewExists(viewName: string): boolean;
            addView(view: SGAppsServer.NodeJsMvc.Controller.View): SGAppsServer.NodeJsMvc.Controller.View;
            render(response: SGAppsServerResponse, viewName: string, options?: any): void;
            removeView(viewName: string): boolean;
            getAction(actionName: string): SGAppsServer.NodeJsMvc.Controller.Action;
            actionExists(actionName: string): boolean;
            addAction(actionName: string, options: any): boolean;
            removeAction(actionName: string): boolean;
            shared: {
                [key: string]: any;
            };
        }
    }
    class NodeJsMvc {
        appPath: string;
        controllers: {
            [key: string]: SGAppsServer.NodeJsMvc.Controller;
        };
        whenReady: Promise<{
            [key: string]: SGAppsServer.NodeJsMvc.Controller;
        }>;
    }
}

declare function routeMatch(route: RequestPathStructure, url: string, strictRouting: boolean, _cache: any): void;

declare type RequestPathStructureMap = {
    key: string;
    path: RequestPathStructure;
    handlers: RequestHandler[];
};

/**
 * <p>a dictionary for storing</p>
 */
declare class SGAppsServerDictionary {
    constructor(options?: {
        name?: string;
        reverse?: boolean;
    });
    _paths: RequestPathStructureMap[];
    _dictionary: {
        [key: string]: RequestHandler[];
    };
    generatePathKey(path: RequestPathStructure): string;
    /**
     * @example
     * server.get('/', (req, res) => {
     *     res.send('root');
     * })
     * // will match "test" "best", everything with est
     * server.get(/.*est/, (req, res) => {
     *     res.send('root');
     * })
     * server.get('/:name/:surname', (req, res) => {
     *     const { name, surname } = req.params;
     *     res.send(`Hi ${name} ${surname}`);
     * })
     * // apply rules with regexp emulation, they are marked with "^" in the start
     * server.get('^/:name([a-z]+)/:age(\d+)', (req, res, next) => {
     *     const { name, age } = req.params;
     *     if (age < 18) {
     *         res.send(`Hi ${name}, you are not allowed`);
     *     } else {
     *         next()
     *     }
     * })
     * // apply rules with regexp emulation, they are marked with "^" in the start
     * server.get('^/([a-z]+)/', (req, res, next) => {
     *     const { name, age } = req.params;
     *     if (age < 18) {
     *         res.send(`Hi ${name}, you are not allowed`);
     *     } else {
     *         next()
     *     }
     * })
     * // add regular expression with group names
     * server.get('^/(?<test>[a-z]+)/', (req, res, next) => {
     *     const { test } = req.params;
     *     res.send(`param: ${test}`);
     * })
     * server.get('/', (req, res) => {
     *     res.send('root');
     * })
     */
    push(path: RequestPathStructure, handlers: RequestHandler[]): void;
    run(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: SGAppsServerDictionaryRunCallBack): void;
}

declare type SGAppsServerDictionaryRunCallBack = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

declare namespace SGAppsServerEmail {
    /**
     * <p>Email : Sends email using the sendmail command.</p>
     * <p>Note: sendmail must be installed: see http://www.sendmail.org/</p>
     * @property to - <p>Email address(es) to which this msg will be sent</p>
     * @property [from] - <p>Email address from which this msg is sent. If not set defaults to the <code>exports.from</code> global setting.</p>
     * @property [replyTo] - <p>Email address to which replies will be sent. If not
     * set defaults to <code>from</code></p>
     * @property [cc] - <p>Email address(es) who receive a copy</p>
     * @property [bcc] - <p>Email address(es) who receive a blind copy</p>
     * @property subject - <p>The subject of the email</p>
     * @property body - <p>The message of the email</p>
     * @property [bodyType] - <p>Content type of body. Only valid option is
     * 'html' (for now). Defaults to text/plain.</p>
     * @property [altText] - <p>If <code>bodyType</code> is set to 'html', this will be sent
     * as the alternative text.</p>
     * @property [timeout] - <p>Duration in milliseconds to wait before killing the
     * process. If not set, defaults to <code>exports.timeout</code> global setting.</p>
     * @property [path] - <p>Optional path to the sendmail executable.</p>
     */
    type Config = {
        to: string[] | string;
        debug?: boolean;
        from?: string;
        replyTo?: string;
        cc?: string | string[];
        bcc?: string | string[];
        subject: string;
        body: string;
        bodyType?: string;
        altText?: string;
        timeout?: number;
        path?: string;
    };
    type Callback = (err: Error) => void;
}

/**
 * @example
 * Example:
 *    var Email = require('path/to/email').Email
 *    var myMsg = new Email(
 *    { from: 'me@example.com'
 *    , to:   'you@example.com'
 *    , subject: 'Knock knock...'
 *    , body: "Who's there?"
 *    })
 *    myMsg.send(function(err){
 *      ...
 *    })
 * @param config - <p>optional configuration object</p>
 */
declare class SGAppsServerEmail {
    constructor(config: SGAppsServerEmail.Config);
    /**
     * <p>Email address from which messages are sent. Used
     * when <code>from</code> was not set on a message.</p>
     */
    static from(email: string): string;
    static isValidAddress(email: string): boolean;
    /**
     * <p>Duration in milliseconds to wait before
     * killing the process. Defaults to 3000. Used when <code>timeout</code> is not set
     * on a message.</p>
     */
    static timeout(milliseconds: number): number;
    /**
     * <p>Send email</p>
     */
    send(callback: SGAppsServerEmail.Callback): void;
    /**
     * <p>get message options</p>
     */
    readonly options: {
        timeout: number;
    };
    /**
     * <p>getter generate encoded body</p>
     */
    readonly encodedBody: string;
    /**
     * <p>getter generate all email structure</p>
     */
    readonly msg: string;
    /**
     * <p>check if email is valid</p>
     */
    valid(callback: SGAppsServerEmail.Callback): void;
}

/**
 * <p>Pretty CLI Logger, with possibility to replace default nodejs' console logger</p>
 * @example
 * // =============================
 * //   Use Logger as 💻 instance
 * // =============================
 *
 * const { LoggerBuilder } = require('@sgapps.io/server');
 *
 * const logger = new LoggerBuilder();
 *
 * logger.log("Hello world");
 * @example
 * // replace default console
 *
 * const { LoggerBuilder } = require('@sgapps.io/server');
 * const logger = new LoggerBuilder();
 * logger.decorateGlobalLogger();
 *
 * console.log("Console Messages are decorated now");
 */
declare class LoggerBuilder {
    /**
     * <p>this parameter may be changed if you decide to change decoration schema</p>
     * @example
     * // Insert an message in VT100 format
     * logger._format = "\x1b[7m {{timestamp}} [{{TYPE}}] <{{title}}> {{file}}:{{line}} ({{method}}){{stack}}\x1b[7m";
     */
    _format: string;
    _debug: boolean;
    _headerFormatters: LoggerBuilder.headerFormatter[];
    prettyCli(ref: any, indent?: number, separator?: string): void;
    log(...messages: any[]): void;
    info(...messages: any[]): void;
    warn(...messages: any[]): void;
    error(...messages: any[]): void;
    /**
     * @example
     * logger.prompt("rerun tests? [y/n]: ", function (err, buffer) {
     * 	// trim spaces from response
     * 	var response = buffer.toString().replace(/^\s*(.*?)\s*$/, '$1');
     * 	if (response === 'y') {
     * 		// write your code
     * 	}
     * });
     */
    prompt(callback: LoggerBuilderPrompt, message: string | Buffer): void;
    decorateGlobalLogger(): void;
}

declare namespace LoggerBuilder {
    type headerFormatterInfo = {
        time: string;
        type: string;
        file: string;
        line: string;
        method: string;
        path: string;
        stack: string;
    };
    type headerFormatter = (info: LoggerBuilder.headerFormatterInfo) => void;
}

declare type LoggerBuilderPrompt = (message: Buffer) => void;

declare class SGAppsServerRequestCookie {
    get(name: string, options?: {
        secure?: boolean;
    }): string;
    set(name: string, value: string, options?: {
        secure?: boolean;
    }): string;
}

/**
 * @property fieldName - <p>field's name</p>
 * @property data.fileName - <p>file's name <code>[duplicate]</code></p>
 * @property data.encoding - <p>file's encoding</p>
 * @property data.fileStream - <p>() =&gt; fileStream</p>
 * @property data.fileSize - <p>size in bytes</p>
 * @property data.contentType - <p>file's mimeType</p>
 * @property data.loaded - <p>indicate if file is fully loaded into <code>fileData</code></p>
 */
declare type SGAppsServerRequestFile = {
    fieldName: string;
    data: {
        fileName: string;
        encoding: string;
        fileStream: Readable;
        fileData: Buffer;
        fileSize: number;
        contentType: string;
        loaded: boolean;
    };
};

/**
 * @property fieldName - <p>field's name</p>
 * @property data.encoding - <p>file's encoding</p>
 * @property data.mimeType - <p>file's mimeType</p>
 */
declare type SGAppsServerRequestPostDataItem = {
    fieldName: string;
    data: {
        value: string;
        encoding: string;
        valTruncated: string;
        fieldNameTruncated: Buffer;
        mimeType: string;
    };
};

declare class SGAppsServerRequestSession {
    constructor(request: SGAppsServerRequest, options: SGAppsSessionManagerOptions);
    _created: number;
    _ip: string;
    /**
     * <p>Session was received from previously saved cookie</p>
     */
    _confirmed: boolean;
    _id: string;
    _options: SGAppsSessionManagerOptions;
    data: any;
    destroy(): void;
}

declare type SGAppsSessionManagerOptions = {
    SESSION_LIFE?: number;
    cookie?: string;
};

declare type SGAppsServerRequestSessionCache = {
    expire: number;
    data: any;
};

declare class SGAppsSessionManager {
    constructor(server: SGAppsServer, options?: SGAppsSessionManagerOptions);
    _options: SGAppsSessionManagerOptions;
    _enabled: boolean;
    _sessions: {
        [key: string]: SGAppsServerRequestSessionCache;
    };
    removeExpiredSessions(): void;
    handleRequest(request: SGAppsServerRequest): void;
}

declare function RequestSessionDecorator(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any): void;

declare type MountUpdatedURL = string;

declare namespace SGAppsServerResponse {
    type pipeFileStaticCallback = (error: Error) => void;
}

declare class TemplateManager {
    constructor(options: {
        _fs: FSLibrary;
    });
    _options: {
        _fs: FSLibrary;
    };
    _viewer: TemplateManagerViewer;
    _env: {
        [key: string]: any;
    };
    templateExists(templateName: string): boolean;
    remove(templateName: string): void;
    add(templateName: string, filePath: string): void;
    addList(templates: {
        [key: string]: string;
    }): void;
    get(templateName: string): TemplateManagerTemplate;
    render(response: SGAppsServerResponse, templateName: string, vars?: {
        [key: string]: any;
    }): void;
}

declare type TemplateManagerTemplate = {
    name: string;
    path: string;
    code?: string;
};

declare class FaceboxTemplate {
    constructor(options: {
        _fs: FSLibrary;
    });
    _debug: boolean;
    _env: {
        [key: string]: any;
    };
    _cachedFiles: {
        [key: string]: string;
    };
    INCLUDE_LEVEL: number;
    render(this: FaceboxTemplate, text: string, vars: {
        [key: string]: any;
    }, env: {
        [key: string]: any;
    }): void;
    renderFile(this: FaceboxTemplate, filePath: string, vars: {
        [key: string]: any;
    }, callback: (...params: any[]) => any): void;
    renderCode(this: FaceboxTemplate, code: string, vars: {
        [key: string]: any;
    }, callback: (...params: any[]) => any, virtualFilePath: string): void;
}

declare type TemplateManagerRenderOptions = any;

declare class TemplateManagerViewer {
    constructor(options: {
        _fs: FSLibrary;
    });
    _facebox: FaceboxTemplate;
    _debug: boolean;
    _env: {
        [key: string]: any;
    };
    renderCode(code: string, vars: {
        [key: string]: any;
    }, virtualFilePath: string, callback: (...params: any[]) => any): void;
    render(this: TemplateManagerViewer, response: SGAppsServerResponse, view: TemplateManagerTemplate, vars: {
        [key: string]: any;
    }): void;
}

declare class SGAppsServerRequest {
    constructor(request: IncomingMessage, server: SGAppsServer);
    cookies: SGAppsServerRequestCookie;
    /**
     * <p>post data buffer cache</p>
     */
    _postDataBuffer: Buffer;
    body: any;
    bodyItems: SGAppsServerRequestPostDataItem[];
    files: {
        [key: string]: SGAppsServerRequestFile[];
    };
    /**
     * <p>request's post received data</p>
     */
    postData: Promise<Buffer>;
    session: SGAppsServerRequestSession;
    getMountUpdatedUrl(url: string): MountUpdatedURL;
    request: IncomingMessage;
    /**
     * @property domain - <p>full domain of url</p>
     * @property domain_short - <p>domain without &quot;www.&quot;</p>
     * @property pathname - <p>url's pathname</p>
     * @property reqQuery - <p>url's query from '?'</p>
     * @property protocol - <p>url.split('://')[0]</p>
     * @property isIp - <p>domain or Ip</p>
     */
    urlInfo: {
        original: string;
        origin: string;
        domain: string;
        domain_short: string;
        pathname: string;
        reqQuery: string;
        protocol: string;
        url: string;
        url_p: string;
        isIp: string;
    };
    query: any;
    mountPath: string;
    /**
     * @example
     * // changing max post size to 4Mb
     * request.MAX_POST_SIZE = 4 * 1024 * 1024;
     * @example
     * // reset max post size to global value
     * request.MAX_POST_SIZE = -1;
     */
    MAX_POST_SIZE: number;
    /**
     * <p>Array of functions to be called on response end</p>
     */
    _destroy: ((...params: any[]) => void)[];
    /**
     * <p>Array of functions to be called on response end</p>
     */
    params: SGAppsServerRequest.RequestParams;
    /**
     * <p>Array of functions to be called on response end</p>
     * @property complete - <p>The message.complete property will be true if a complete HTTP message has been received and successfully parsed.</p>
     * @property aborted - <p>The message.aborted property will be true if the request has been aborted.</p>
     * @property closed - <p>Indicates that the underlying connection was closed.</p>
     */
    _flags: {
        complete: boolean;
        aborted: boolean;
        closed: boolean;
    };
}

declare namespace SGAppsServerRequest {
    type RequestParams = {
        [key: string]: string;
    } | string[];
}

declare class SGAppsServerResponse {
    constructor(response: ServerResponse, server: SGAppsServer);
    sendError(error: Error, options?: {
        statusCode?: number;
    }): void;
    pipeFileStatic(filePath: string, fileName: string, callback: SGAppsServerResponse.pipeFileStaticCallback): void;
    /**
     * @param callback - <p>represents a <code>Function(Error)</code></p>
     */
    pipeFile(filePath: string, callback: SGAppsServerErrorOnlyCallback): void;
    /**
     * <p>if it returns <code>false</code> than the action was not possible</p>
     */
    redirect(url: string, options?: {
        statusCode?: number;
        headers?: {
            [key: string]: string | string[];
        };
    }): void;
    send(data: string | Buffer | any | any[], options?: {
        statusCode?: number;
        headers?: {
            [key: string]: string | string[];
        };
    }): void;
    sendStatusCode(statusCode: number): void;
    response: ServerResponse;
    /**
     * <p>Array of functions to be called on response end</p>
     */
    _destroy: ((...params: any[]) => void)[];
    /**
     * <p>Array of functions to be called on response end</p>
     * @property finished - <p>will be true if response.end() has been called.</p>
     * @property sent - <p>Is true if all data has been flushed to the underlying system, immediately before the 'finish' event is emitted.</p>
     * @property closed - <p>Indicates that the the response is completed, or its underlying connection was terminated prematurely (before the response completion).</p>
     */
    _flags: {
        finished: boolean;
        sent: boolean;
        closed: boolean;
    };
}

declare class SGAppsServerDecoratorsLibrary {
    /**
     * <p>this decorator is not enabled by default</p>
     */
    static NodeJsMvcDecorator(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any): void;
}

declare type SGAppsServerErrorCallBack = (err: Error, request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

declare type SGAppsServerErrorOnlyCallback = (err: Error) => void;

declare interface FSLibrary extends FSLibraryModule {
}

declare class FSLibrary implements FSLibraryModule {
}

declare class SGAppsServerShared {
}

declare type SGAppsServerDecorator = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any) => void;

declare type RequestPathStructure = string | RegExp;

declare type RequestHandler = (request: SGAppsServerRequest, response: SGAppsServerResponse, next: (...params: any[]) => any) => void;

declare type SGAppsServerOptions = {
    server?: Server;
    strictRouting?: boolean;
    _DEBUG_MAX_HANDLER_EXECUTION_TIME?: number;
};

/**
 * <p>HTTP Server for high performance results</p>
 * @example
 * // ================================
 * //   Start your 🚀 Web-Server app
 * // ================================
 *
 * const { SGAppsServer } = require('@sgapps.io/server');
 * const app = new SGAppsServer();
 *
 * app.get('/', function (req, res) {
 *   res.send('hello world')
 * })
 *
 * app.server().listen(8080, () => {
 *   app.logger.log('Server is running on port 8080');
 * })
 * @example
 * // ========================================
 * //   Start your 🚀 Web-Server app Extended
 * // ========================================
 *
 * const { SGAppsServer } = require('@sgapps.io/server');
 * const app = new SGAppsServer();
 *
 * app.get('/', function (req, res) {
 *   res.send('hello world')
 * })
 *
 * app.whenReady.then(() => {
 *   app.SessionManager.cookie = 'ssid';
 *   app.SessionManager.SESSION_LIFE = 120; // seconds
 *
 *   app.server().listen(8080, () => {
 *     app.logger.log('Server is running on port 8080');
 *   })
 * }, app.logger.error);
 * @param [options._DEBUG_MAX_HANDLER_EXECUTION_TIME = 500] - <p>console shows an warn if handler is executed more than ( works in debug mode )</p>
 */
declare class SGAppsServer {
    constructor(options?: {
        server?: Server;
        strictRouting?: boolean;
        _DEBUG_MAX_HANDLER_EXECUTION_TIME?: any;
        decorators?: SGAppsServerDecorator[];
    });
    NodeJsMvc: SGAppsServer.NodeJsMvc;
    /**
     * @property [_enabled = true] - <p>if is changed to false server will not decorate requests with cookie manager</p>
     */
    CookiesManager: {
        COOKIES_KEY: string;
        _enabled?: boolean;
        handle: (...params: any[]) => any;
    };
    SessionManager: SGAppsSessionManager;
    TemplateManager: TemplateManager;
    _server: Server;
    _decorators: SGAppsServerDecorator[];
    _options: SGAppsServerOptions;
    STATUS_CODES: {
        [key: number]: string;
    };
    shared: SGAppsServerShared;
    logger: LoggerBuilder;
    Email(config: SGAppsServerEmail.Config): SGAppsServerEmail;
    mountPath: string;
    _fs: any;
    _path: any;
    EXTENSIONS: ResourcesExtensions;
    _requestListeners: {
        [key: string]: SGAppsServerDictionary;
    };
    /**
     * <p>default value is <code>16 Kb</code> » <code>16 * 1024</code></p>
     */
    MAX_POST_SIZE: number;
    whenReady: Promise<SGAppsServer>;
    handleRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, callback: SGAppsServerDictionaryRunCallBack): void;
    handleStaticRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, path: string, callback: SGAppsServerErrorCallBack): void;
    handle(request: IncomingMessage, response: ServerResponse, callback?: SGAppsServerDictionaryRunCallBack): void;
    server(): Server;
    use(path: string | RequestHandler, ...handlers?: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>POST</code> method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.</p>
     */
    post(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>GET</code> method requests a representation of the specified resource. Requests using GET should only retrieve data.</p>
     */
    get(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>HEAD</code> method asks for a response identical to that of a GET request, but without the response body.</p>
     */
    head(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>PUT</code> method replaces all current representations of the target resource with the request payload.</p>
     */
    put(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>TRACE</code> method performs a message loop-back test along the path to the target resource.</p>
     */
    trace(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>DELETE</code> method deletes the specified resource.</p>
     */
    delete(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>OPTIONS</code> method is used to describe the communication options for the target resource.</p>
     */
    options(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>CONNECT</code> method establishes a tunnel to the server identified by the target resource.</p>
     */
    connect(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>The <code>PATCH</code> method is used to apply partial modifications to a resource.</p>
     */
    patch(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>add handler to all methods</p>
     */
    all(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    /**
     * <p>add final handler to all methods, last added is first</p>
     */
    finalHandler(path: RequestPathStructure, ...handlers: RequestHandler[]): SGAppsServer;
    handlePostData(options?: {
        MAX_POST_SIZE?: number;
        error?: {
            statusCode: number;
            message?: string;
        };
    }): SGAppsServerHandlerPostData;
}

declare type SGAppsServerHandlerPostData = (request: SGAppsServerRequest, response: SGAppsServerResponse, next: (...params: any[]) => any) => void;

declare type ResourcesExtensions = {
    mime: (...params: any[]) => any;
    LIST_ASSOC: {
        [key: string]: string;
    };
};

