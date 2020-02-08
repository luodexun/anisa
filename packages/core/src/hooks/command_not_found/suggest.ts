import {Hook} from '@oclif/config'

const hook: Hook<'command_not_found'> = async function (opts) {
  process.stdout.write(`example hook running ${opts.id}\n`)
}

export default hook
