import { expect, test } from '@oclif/test'
import * as sinon from 'sinon'

// import Config from '../../src/config'
import mockInquirer from '../mocks/inquirer'
import mockKeytar from '../mocks/keytar'
import mockConfig from '../mocks/config'

describe('login', () => {
  const testSuccess = test

  let sandbox: sinon.SinonSandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    mockKeytar(sandbox)
    mockConfig(sandbox)
    // COMBAK: Look up alternatives to mocking inquirer.
    // I really would love to test the login functionality alongside it
    mockInquirer(sandbox)
  })

  afterEach(() => {
    sandbox.restore()
  })

  // function login() {
  //   Config.set({
  //     auth: {
  //       uid: 'yurick@novatics.com.br',
  //       'access-token': 'fr3eAce35s',
  //       'token-type': 'Bearer',
  //       client: 'the usual',
  //     },
  //   })
  // }

  testSuccess
    .stdout()
    .command(['start'])
    .exit(1)
    .it('complains about not being logged', ctx => {
      expect(ctx.stdout).to.contain(
        'You need to be logged in order to execute this action.',
      )
    })

  // testSuccess
  //   .do(login)
  //   .stdout()
  //   .command(['start'])
  //   .it('properly starts a new task', ctx => {
  //     expect(ctx.stdout).to.contain('Started task')
  //   })
})
