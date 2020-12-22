'use strict'

const { Pact } = require('@pact-foundation/pact')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const path = require('path')
const PactInteractionBuilder = require('../../../test-helpers/pact/pact-interaction-builder').PactInteractionBuilder
const Connector = require('../../../../app/services/clients/connector.client').ConnectorClient
const gatewayAccountFixtures = require('../../../fixtures/gateway-account.fixtures')

// Constants
const ACCOUNTS_RESOURCE = '/v1/api/accounts'
const port = Math.floor(Math.random() * 48127) + 1024
const connectorClient = new Connector(`http://localhost:${port}`)
const expect = chai.expect
const existingGatewayAccountId = 666

// Global setup
chai.use(chaiAsPromised)

describe('connector client - patch apple pay toggle (enabled) request', () => {
  const patchRequestParams = { path: 'allow_apple_pay', value: true }
  const request = gatewayAccountFixtures.validGatewayAccountPatchRequest(patchRequestParams)

  let provider = new Pact({
    consumer: 'selfservice',
    provider: 'connector',
    port: port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    pactfileWriteMode: 'merge'
  })

  before(() => provider.setup())
  after(() => provider.finalize())

  describe('apple pay toggle - supported payment provider request', () => {
    const applePayToggleSupportedPaymentProviderState =
      `a gateway account supporting digital wallet with external id ${existingGatewayAccountId} exists in the database`

    before(() => {
      return provider.addInteraction(
        new PactInteractionBuilder(`${ACCOUNTS_RESOURCE}/${existingGatewayAccountId}`)
          .withUponReceiving('a valid patch apple pay toggle (enabled) request')
          .withState(applePayToggleSupportedPaymentProviderState)
          .withMethod('PATCH')
          .withRequestBody(request)
          .withStatusCode(200)
          .withResponseHeaders({})
          .build())
    })

    afterEach(() => provider.verify())

    it('should toggle successfully', done => {
      connectorClient.toggleApplePay(existingGatewayAccountId, true, null)
        .should.be.fulfilled
        .notify(done)
    })
  })

  describe('apple pay toggle with unsupported payment provider request', () => {
    const applePayToggleUnsupportedPaymentProviderState = `User ${existingGatewayAccountId} exists in the database`

    before(() => {
      return provider.addInteraction(
        new PactInteractionBuilder(`${ACCOUNTS_RESOURCE}/${existingGatewayAccountId}`)
          .withUponReceiving('a valid patch apple pay toggle (enabled) request')
          .withState(applePayToggleUnsupportedPaymentProviderState)
          .withMethod('PATCH')
          .withRequestBody(request)
          .withStatusCode(400)
          .build())
    })

    afterEach(() => provider.verify())

    it('should respond bad request for unsupported payment provider', done => {
      connectorClient.toggleApplePay(existingGatewayAccountId, true, null)
        .should.be.rejected.then(response => {
          expect(response.errorCode).to.equal(400)
        }).should.notify(done)
    })
  })
})
