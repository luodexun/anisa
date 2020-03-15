import {expect, test} from '@oclif/test'

describe('core:stop', () => {
  test
  .stdout()
  .command(['core:stop'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['core:stop', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
