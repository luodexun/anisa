@luodexun/core
==============

core is start

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@luodexun/core.svg)](https://npmjs.org/package/@luodexun/core)
[![Downloads/week](https://img.shields.io/npm/dw/@luodexun/core.svg)](https://npmjs.org/package/@luodexun/core)
[![License](https://img.shields.io/npm/l/@luodexun/core.svg)](https://github.com/https://github.com/luodexun/core.git/core/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @luodexun/core
$ core COMMAND
running command...
$ core (-v|--version|version)
@luodexun/core/0.0.8 darwin-x64 node-v12.13.1
$ core --help [COMMAND]
USAGE
  $ core COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`core core:debug [FILE]`](#core-coredebug-file)
* [`core core:start [FILE]`](#core-corestart-file)
* [`core hello [FILE]`](#core-hello-file)
* [`core help [COMMAND]`](#core-help-command)

## `core core:debug [FILE]`

describe the command here

```
USAGE
  $ core core:debug [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [dist/commands/core/debug.ts](https://github.com/luodexun/core.git/core/blob/v0.0.8/dist/commands/core/debug.ts)_

## `core core:start [FILE]`

describe the command here

```
USAGE
  $ core core:start [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [dist/commands/core/start.ts](https://github.com/luodexun/core.git/core/blob/v0.0.8/dist/commands/core/start.ts)_

## `core hello [FILE]`

describe the command here

```
USAGE
  $ core hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ core hello
  hello world from ./src/hello.ts!
```

_See code: [dist/commands/hello.ts](https://github.com/luodexun/core.git/core/blob/v0.0.8/dist/commands/hello.ts)_

## `core help [COMMAND]`

display help for core

```
USAGE
  $ core help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
