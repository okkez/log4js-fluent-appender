'use strict';
/* globals describe, it, beforeEach, afterEach  */
/* eslint node/no-unpublished-require: ["error", {"allowModules": ["testdouble"]}] */
const td = require('testdouble');
const log4js = require('log4js');
const fluentLogger = require('fluent-logger');

describe('log4js-fluent-appender', () => {
  beforeEach(() => {
    td.replace(fluentLogger, 'createFluentSender');
  });
  afterEach(() => {
    td.reset();
  });

  let getLogger = (tag_prefix, options) => {
    log4js.configure({
      appenders: {
        fluent: {
          type: './lib/index',
          tag_prefix: tag_prefix,
          options: options
        }
      },
      categories: {
        default: {
          appenders: ['fluent'],
          level: 'info'
        }
      }
    });
    return log4js.getLogger();
  };

  it('should send log records with levelTag', (done) => {
    const tag_prefix = 'tag_prefix';
    const options = {
      levelTag: true,
      host: 'localhost',
      port: 24224
    };
    const fakeSender = {
      emit: td.function()
    };
    td.when(fluentLogger.createFluentSender(tag_prefix, options))
      .thenReturn(fakeSender);
    const logger = getLogger(tag_prefix, options);
    logger.info('This is info message!');
    td.verify(fakeSender.emit('INFO', {
      timestamp: td.matchers.anything(),
      category: 'default',
      levelInt: 20000,
      levelStr: 'INFO',
      data: 'This is info message!'
    }));
    done();
  });

  it('should send log records without levelTag', (done) => {
    const tag_prefix = 'tag_prefix';
    const options = {
      levelTag: false,
      host: 'localhost',
      port: 24224
    };
    const fakeSender = {
      emit: td.function()
    };
    td.when(fluentLogger.createFluentSender(tag_prefix, options))
      .thenReturn(fakeSender);
    const logger = getLogger(tag_prefix, options);
    logger.info('This is info message!');
    td.verify(fakeSender.emit({
      timestamp: td.matchers.anything(),
      category: 'default',
      levelInt: 20000,
      levelStr: 'INFO',
      data: 'This is info message!'
    }));
    done();
  });
});
