'use strict';
/**
 * log4js appender support
 */
const FluentSender = require('fluent-logger');
const util = require('util');
const DEFAULT_TAG = 'log4js';

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
function fluentAppender(config, layout){
  const tag_prefix = config.tag_prefix || DEFAULT_TAG;
  const options = config.options || {};
  const logSender = new FluentSender.createFluentSender(tag_prefix, options);

  const appender = function(loggingEvent) {
    const data =  util.format.apply(null, loggingEvent.data);
    const rec = {
      timestamp: loggingEvent.startTime.getTime(),
      category: loggingEvent.categoryName,
      levelInt: loggingEvent.level.level,
      levelStr: loggingEvent.level.levelStr,
      data: data
    };
    if (options.levelTag !== false) {
      logSender.emit(loggingEvent.level.levelStr, rec);
    } else {
      logSender.emit(rec);
    }
  };
  appender.shutdown = (complete) => {
    logSender.end(null, null, complete);
  };
  ['addListener', 'on', 'once', 'removeListener', 'removeAllListeners', 'setMaxListeners', 'getMaxListeners', '_setupErrorHandler'].forEach(function(attr, i){
    appender[attr] = function(){
      return logSender[attr].apply(logSender, Array.prototype.slice.call(arguments));
    };
  });
  return appender;
}

function configure(config, layouts){
  let layout;
  if (config.layout) {
	  layout = layouts.layout(config.layout.type, config.layout);
  }
  return fluentAppender(config, layout);
}

exports.configure = configure;
