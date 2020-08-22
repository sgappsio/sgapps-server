
declare module "sgapps-server" {

import * as FSLibrary from 'fs';

export = FSLibrary;

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
}/**
 * <p>a dictionary for storing</p>
 */
declare class SGAppsServerDictionary {
    constructor(options?: {
        reverse?: boolean;
    });
    push(path: RequestPathStructure, handler: RequestHandler): void;
    run(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: SGAppsServerDictionaryRunCallBack): void;
}

declare type SGAppsServerDictionaryRunCallBack = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

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
    render(response: SGAppsServerResponse, templateName: string, vars: {
        [key: string]: any;
    }): void;
}

declare type TemplateManagerTemplate = {
    name: string;
    path: string;
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
    renderCode(code: string, vars: {
        [key: string]: any;
    }, virtualFilePath: string, callback: (...params: any[]) => any): void;
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
    send(data: string | Buffer | any | any[]): void;
    response: ServerResponse;
}

declare type SGAppsServerErrorCallBack = (err: Error, request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

declare type SGAppsServerErrorOnlyCallback = (err: Error) => void;

declare class FSLibrary {
}

declare class SGAppsServerShared {
}

declare type SGAppsServerDecorator = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any) => void;

declare type RequestPathStructure = string | RegExp;

declare type RequestHandler = (request: SGAppsServerRequest, response: SGAppsServerResponse, next: (...params: any[]) => any) => void;

declare type SGAppsServerOptions = {
    server?: Server;
    strictRouting?: boolean;
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
 */
declare class SGAppsServer {
    constructor(options?: {
        server?: Server;
        strictRouting?: boolean;
        decorators?: SGAppsServerDecorator[];
    });
    /**
     * @property [_enabled = true] - <p>if is changed to false server will not decorate requests with cookie manager</p>
     */
    CookiesManager: {
        COOKIES_KEY: string;
        _enabled?: boolean;
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
    handleRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, callback: SGAppsServerDictionaryRunCallBack): void;
    handleStaticRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, path: string, callback: SGAppsServerErrorCallBack): void;
    handle(request: IncomingMessage, response: ServerResponse, callback: SGAppsServerDictionaryRunCallBack): void;
    server(): Server;
    use(handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>POST</code> method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.</p>
     */
    post(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>GET</code> method requests a representation of the specified resource. Requests using GET should only retrieve data.</p>
     */
    get(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>HEAD</code> method asks for a response identical to that of a GET request, but without the response body.</p>
     */
    head(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>PUT</code> method replaces all current representations of the target resource with the request payload.</p>
     */
    put(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>TRACE</code> method performs a message loop-back test along the path to the target resource.</p>
     */
    trace(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>DELETE</code> method deletes the specified resource.</p>
     */
    delete(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>OPTIONS</code> method is used to describe the communication options for the target resource.</p>
     */
    options(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>CONNECT</code> method establishes a tunnel to the server identified by the target resource.</p>
     */
    connect(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>PATCH</code> method is used to apply partial modifications to a resource.</p>
     */
    patch(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>add handler to all methods</p>
     */
    all(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>add final handler to all methods, last added is first</p>
     */
    finalHandler(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
}

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
    function SGAppsServer(): SGAppsServer;
    function LoggerBuilder(): LoggerBuilder;
}/**
 * <p>a dictionary for storing</p>
 */
declare class SGAppsServerDictionary {
    constructor(options?: {
        reverse?: boolean;
    });
    push(path: RequestPathStructure, handler: RequestHandler): void;
    run(request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: SGAppsServerDictionaryRunCallBack): void;
}

declare type SGAppsServerDictionaryRunCallBack = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

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
    render(response: SGAppsServerResponse, templateName: string, vars: {
        [key: string]: any;
    }): void;
}

declare type TemplateManagerTemplate = {
    name: string;
    path: string;
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
    renderCode(code: string, vars: {
        [key: string]: any;
    }, virtualFilePath: string, callback: (...params: any[]) => any): void;
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
    send(data: string | Buffer | any | any[]): void;
    response: ServerResponse;
}

declare type SGAppsServerErrorCallBack = (err: Error, request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer) => void;

declare type SGAppsServerErrorOnlyCallback = (err: Error) => void;

declare class FSLibrary {
}

declare class SGAppsServerShared {
}

declare type SGAppsServerDecorator = (request: SGAppsServerRequest, response: SGAppsServerResponse, server: SGAppsServer, callback: (...params: any[]) => any) => void;

declare type RequestPathStructure = string | RegExp;

declare type RequestHandler = (request: SGAppsServerRequest, response: SGAppsServerResponse, next: (...params: any[]) => any) => void;

declare type SGAppsServerOptions = {
    server?: Server;
    strictRouting?: boolean;
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
 */
declare class SGAppsServer {
    constructor(options?: {
        server?: Server;
        strictRouting?: boolean;
        decorators?: SGAppsServerDecorator[];
    });
    /**
     * @property [_enabled = true] - <p>if is changed to false server will not decorate requests with cookie manager</p>
     */
    CookiesManager: {
        COOKIES_KEY: string;
        _enabled?: boolean;
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
    handleRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, callback: SGAppsServerDictionaryRunCallBack): void;
    handleStaticRequest(request: SGAppsServerRequest, response: SGAppsServerResponse, path: string, callback: SGAppsServerErrorCallBack): void;
    handle(request: IncomingMessage, response: ServerResponse, callback: SGAppsServerDictionaryRunCallBack): void;
    server(): Server;
    use(handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>POST</code> method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.</p>
     */
    post(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>GET</code> method requests a representation of the specified resource. Requests using GET should only retrieve data.</p>
     */
    get(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>HEAD</code> method asks for a response identical to that of a GET request, but without the response body.</p>
     */
    head(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>PUT</code> method replaces all current representations of the target resource with the request payload.</p>
     */
    put(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>TRACE</code> method performs a message loop-back test along the path to the target resource.</p>
     */
    trace(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>DELETE</code> method deletes the specified resource.</p>
     */
    delete(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>OPTIONS</code> method is used to describe the communication options for the target resource.</p>
     */
    options(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>CONNECT</code> method establishes a tunnel to the server identified by the target resource.</p>
     */
    connect(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>The <code>PATCH</code> method is used to apply partial modifications to a resource.</p>
     */
    patch(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>add handler to all methods</p>
     */
    all(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
    /**
     * <p>add final handler to all methods, last added is first</p>
     */
    finalHandler(path: RequestPathStructure, handler: RequestHandler): SGAppsServer;
}

declare type ResourcesExtensions = {
    mime: (...params: any[]) => any;
    LIST_ASSOC: {
        [key: string]: string;
    };
};
