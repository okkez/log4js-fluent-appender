# log4js appender for fluent-logger

This package provides [log4js-node](https://github.com/nomiddlename/log4js-node) appender for [fluent-logger](https://github.com/fluent/fluent-logger-node).

[![NPM](https://nodei.co/npm/log4js-fluent-appender.png)](https://nodei.co/npm/log4js-fluent-appender/)

[![Build Status](https://travis-ci.org/okkez/log4js-fluent-appender.svg?branch=master)](https://travis-ci.org/okkez/log4js-fluent-appender)

## Install

```
$ npm install log4js-fluent-appender
```

## Prerequistes

Fluent daemon should listen on TCP port.

Simple configuration is following:

```aconf
<source>
  @type forward
  port 24224
</source>

<match **.*>
  @type stdout
</match>
```

## Usage

```js
const log4js = require('log4js');

log4js.configure({
  appenders: {
    fluent: {
      type: 'log4js-fluent-appender',
      tag_prefix: 'tag_prefix',
      options: {
        levelTag: true,
        host: 'localhost',
        port: 24224
      }
    }
  },
  categories: {
    default: {
      appenders: ['fluent'],
      level: 'info'
    }
  }
});

const logger = log4js.getLogger();

logger.info('This is info message!');

setTimeout(() => {
  log4js.shutdown(() => {});
}, 1000);
```

See also:

* [fluent-logger-node](https://github.com/fluent/fluent-logger-node)
* [log4js-node](https://github.com/nomiddlename/log4js-node)

### Events

```js
const log4js = require('log4js');

const fluentAppender = log4js.configure({
  appenders: {
    fluent: {
      type: 'log4js-fluent-appender',
      tag_prefix: 'tag_prefix',
      options: {
        levelTag: true,
        host: 'localhost',
        port: 24224
      }
    }
  },
  categories: {
    default: {
      appenders: ['fluent'],
      level: 'info'
    }
  }
});

fluentAppender.on('connect', () => {
  console.log('connect event!');
});
fluentAppender.on('error', (error) => {
  console.log('error occured!');
});

```

* `connect` : Handle [net.Socket Event: connect](https://nodejs.org/api/net.html#net_event_connect)
* `error` : Handle [net.Socket Event: error](https://nodejs.org/api/net.html#net_event_error_1)

## Options

**levelTag**

If `false`, tag is "mytag". Otherwise tag is "mytag.INFO".
If you want to omit level tag such as `.INFO`, you must specify this value to `false`.

See [fluent-logger](https://github.com/fluent/fluent-logger-node).

## License

Apache License, Version 2.0.

