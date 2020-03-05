@luodexun/core
==============

start of core

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@luodexun/core.svg)](https://npmjs.org/package/@luodexun/core)
[![Downloads/week](https://img.shields.io/npm/dw/@luodexun/core.svg)](https://npmjs.org/package/@luodexun/core)
[![License](https://img.shields.io/npm/l/@luodexun/core.svg)](https://github.com/&#34;useWorkspaces&#34;: true,/&#34;useWorkspaces&#34;: true,/blob/master/package.json)

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
@luodexun/core/0.0.25 darwin-x64 node-v12.13.1
$ core --help [COMMAND]
USAGE
  $ core COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`core command`](#core-command)
* [`core core:debug [FILE]`](#core-coredebug-file)
* [`core core:start [FILE]`](#core-corestart-file)
* [`core help [COMMAND]`](#core-help-command)

## `core command`

```
USAGE
  $ core command
```

_See code: [src/commands/command.ts](https://github.com/luodexun/anisa/blob/v0.0.25/src/commands/command.ts)_

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

_See code: [src/commands/core/debug.ts](https://github.com/luodexun/anisa/blob/v0.0.25/src/commands/core/debug.ts)_

## `core core:start [FILE]`

test start

```
USAGE
  $ core core:start [FILE]

OPTIONS
  --bip38=bip38                     the encrypted bip38
  --bip39=bip39                     the plain text bip39 passphrase
  --disableDiscovery                permanently disable any peer discovery
  --env=env                         [default: production]
  --ignoreMinimumNetworkReach       ignore the minimum network reach on start
  --launchMode=launchMode           the mode the relay will be launched in (seed only at the moment)
  --network=devnet|mainnet|testnet  the name of the network that should be used
  --networkStart                    indicate that this is the first start of seeds
  --password=password               the password for the encrypted bip38
  --skipDiscovery                   skip the initial peer discovery
  --token=token                     the name of the token that should be used

EXAMPLES
  Run core
  $ ark core:run

  Run core as genesis
  $ ark core:run --networkStart

  Disable any discovery by other peers
  $ ark core:run --disableDiscovery

  Skip the initial discovery
  $ ark core:run --skipDiscovery

  Ignore the minimum network reach
  $ ark core:run --ignoreMinimumNetworkReach

  Start a seed
  $ ark core:run --launchMode=seed
```

_See code: [src/commands/core/start.ts](https://github.com/luodexun/anisa/blob/v0.0.25/src/commands/core/start.ts)_

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
