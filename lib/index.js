'use strict';
/**
 * log4js appender support
 */
const FluentSender = require('fluent-logger');
const DEFAULT_TAG = 'log4js';

require('es6-object-assign').polyfill();

/**
 *
 * log4js.configure({
 *   appenders: {
 *     fluent: {
 *       type: 'log4js-fluent-appender',
 *       tag_prefix: 'tag_prefix',
 *       options: {
 *         levelTag: true,
 *         host: 'localhost',
 *         port: 24224,
 *       }
 *     }
 *   },
 *   catagories: {
 *     default: { appenders: ['fluent'], level: 'info' }
 *   }
 * });
 *
 */
function fluentAppender(config, layout) {
  const tag_prefix = config.tag_prefix || DEFAULT_TAG;
  const options = config.options || {};
  const logSender = FluentSender.createFluentSender(tag_prefix, options);

  const appender = function(loggingEvent) {
    const data =  loggingEvent.data[0];
    const extra = loggingEvent.data.splice(1);

    let rec = {
      timestamp: loggingEvent.startTime.getTime(),
      category: loggingEvent.categoryName,
      levelInt: loggingEvent.level.level,
      levelStr: loggingEvent.level.levelStr,
      context: loggingEvent.context,
      data: data
    };

    if (extra.length > 0) {
      rec['extra'] = Object.assign.apply(null, extra);
    }

    if (options.levelTag !== false) {
      logSender.emit(loggingEvent.level.levelStr, rec);
    } else {
      logSender.emit(rec);
    }
  };
  appender.shutdown = (complete) => {
    logSender.end(null, null, complete);
  };

  ['addListener', 'on', 'once', 'removeListener', 'removeAllListeners', 'setMaxListeners', 'getMaxListeners', '_setupErrorHandler'].forEach((attr, i) => {
    appender[attr] = function() {
      return logSender[attr].apply(logSender, Array.prototype.slice.call(arguments));
    };
  });
  return appender;
}

function configure(config, layouts) {
  let layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return fluentAppender(config, layout);
}

module.exports.configure = configure;
