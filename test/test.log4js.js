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
      context: {},
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
      context: {},
      data: 'This is info message!'
    }));
    done();
  });

  it('should log context', (done) => {
    const tag_prefix = 'tag_prefix';
    const options = {
      levelTag: false,
      host: 'localhost',
      port: 24224
    };
    const fakeSender = {
      emit: td.function()
    };
    td
      .when(fluentLogger.createFluentSender(tag_prefix, options))
      .thenReturn(fakeSender);
    const logger = getLogger(tag_prefix, options);

    logger.addContext('context_key1', 'context_value');
    logger.addContext('context_key2', 1234);
    logger.addContext('context_key3', '');
    logger.removeContext('context_key3');

    logger.info('This is info message!');

    td.verify(fakeSender.emit({
      timestamp: td.matchers.anything(),
      category: 'default',
      levelInt: 20000,
      levelStr: 'INFO',
      context: {
        context_key1: 'context_value',
        context_key2: 1234
      },
      data: 'This is info message!'
    }));
    done();
  });

  it('should log extra', (done) => {
    const tag_prefix = 'tag_prefix';
    const options = {
      levelTag: false,
      host: 'localhost',
      port: 24224
    };
    const fakeSender = {
      emit: td.function()
    };
    td
      .when(fluentLogger.createFluentSender(tag_prefix, options))
      .thenReturn(fakeSender);
    const logger = getLogger(tag_prefix, options);

    logger.info('This is info message!', {extra1: true, extra2: false}, {extra3: true});

    td.verify(fakeSender.emit({
      timestamp: td.matchers.anything(),
      category: 'default',
      levelInt: 20000,
      levelStr: 'INFO',
      context: {},
      data: 'This is info message!',
      extra: {
        extra1: true,
        extra2: false,
        extra3: true,
      }
    }));
    done();
  });

});
