/**
 * Email : Sends email using the sendmail command.
 *
 * Note: sendmail must be installed: see http://www.sendmail.org/
 * @memberof SGAppsServerEmail
 * @typedef {object} Config
 * @property {string[]|string} to Email address(es) to which this msg will be sent
 * @property {boolean} [debug=false]
 * @property {string} [from] Email address from which this msg is sent. If not set defaults to the `exports.from` global setting.
 * @property {string} [replyTo] Email address to which replies will be sent. If not
 *      set defaults to `from`
 * @property {string|string[]} [cc] Email address(es) who receive a copy
 * @property {string|string[]} [bcc] Email address(es) who receive a blind copy
 * @property {string} subject The subject of the email
 * @property {string} body The message of the email
 * @property {string} [bodyType] Content type of body. Only valid option is
 *      'html' (for now). Defaults to text/plain.
 * @property {string} [altText] If `bodyType` is set to 'html', this will be sent
 *      as the alternative text.
 * @property {number} [timeout] Duration in milliseconds to wait before killing the
 *      process. If not set, defaults to `exports.timeout` global setting.
 * @property {string} [path] Optional path to the sendmail executable.
 */
const _email = require('./../resources/thirdparty/email');

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
 * 
 * @class
 * @name SGAppsServerEmail
 * @param {SGAppsServerEmail.Config} config optional configuration object
 */
function Email(config) {
    return new _email.Email(config);
};

/**
 * Email address from which messages are sent. Used
 * when `from` was not set on a message.
 * @memberof SGAppsServerEmail
 * @method from
 * @param {string} email
 * @returns {string}
 */
Email.from = function (email) {
    if (email && _email.isValidAddress(email)) _email.from = email;
    return _email.from;
}

/**
 * @memberof SGAppsServerEmail
 * @method isValidAddress
 * @param {string} email
 * @returns {boolean}
 */
Email.isValidAddress = function (email) {
    return _email.isValidAddress(email);
}

/**
 * Duration in milliseconds to wait before
 * killing the process. Defaults to 3000. Used when `timeout` is not set
 * on a message.
 * @memberof SGAppsServerEmail
 * @method timeout
 * @param {number} milliseconds
 * @returns {number}
 */
Email.timeout = function (milliseconds) {
    if (milliseconds && typeof(milliseconds) === "number") _email.timeout = milliseconds;
    return _email.timeout;
}

/**
 * @memberof SGAppsServerEmail
 * @callback Callback
 * @param {Error} err
 */
/**
 * Send email
 * @memberof SGAppsServerEmail#
 * @method send
 * @param {SGAppsServerEmail.Callback} callback
 */

/**
 * get message options
 * @memberof SGAppsServerEmail#
 * @readonly
 * @name options
 * @type {object}
 * @property {number} timeout
 */

/**
 * getter generate encoded body
 * @memberof SGAppsServerEmail#
 * @readonly
 * @name encodedBody
 * @type {string}
 */

/**
 * getter generate all email structure
 * @memberof SGAppsServerEmail#
 * @readonly
 * @name msg
 * @type {string}
 */

/**
 * check if email is valid
 * @memberof SGAppsServerEmail#
 * @method valid
 * @param {SGAppsServerEmail.Callback} callback
 */

/**
 * @private
 * @type {SGAppsServerEmail}
 */
module.exports = Email;

