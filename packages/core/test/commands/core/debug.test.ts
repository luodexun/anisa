import {expect, test} from '@oclif/test'

describe('core:debug', () => {
  test
  .stdout()
  .command(['core:debug'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['core:debug', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
