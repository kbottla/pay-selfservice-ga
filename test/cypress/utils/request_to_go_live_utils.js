'use strict'

const variables = {
  userExternalId: 'userExternalId',
  gatewayAccountId: 42,
  serviceExternalId: 'afe452323dd04d1898672bfaba25e3a6'
}

const buildServiceRoleForGoLiveStage = (goLiveStage) => {
  return {
    service: {
      external_id: variables.serviceExternalId,
      current_go_live_stage: goLiveStage,
      gateway_account_ids: [variables.gatewayAccountId]
    }
  }
}

const buildServiceRoleForMerchantDetailsField = (merchantDetails, goLiveStage) => {
  return {
    service: {
      external_id: variables.serviceExternalId,
      gateway_account_ids: [variables.gatewayAccountId],
      merchant_details: merchantDetails,
      current_go_live_stage: goLiveStage
    }
  }
}

const simpleStub = (serviceRole) => {
  return [
    {
      name: 'getUserSuccess',
      opts: {
        external_id: variables.userExternalId,
        service_roles: [serviceRole]
      }
    },
    {
      name: 'getGatewayAccountSuccess',
      opts: { gateway_account_id: variables.gatewayAccountId }
    }
  ]
}

const stubWithGoLiveStage = (currentGoLiveStage) => {
  return {
    name: 'patchUpdateServiceSuccess',
    opts: {
      external_id: variables.serviceExternalId,
      gateway_account_ids: [variables.gatewayAccountId],
      current_go_live_stage: currentGoLiveStage
    }
  }
}

const stubGoLiveStageError = (currentGoLiveStage) => {
  return {
    name: 'patchGoLiveStageFailure',
    opts: {
      external_id: variables.serviceExternalId,
      gateway_account_ids: [variables.gatewayAccountId],
      current_go_live_stage: currentGoLiveStage,
      path: 'current_go_live_stage',
      value: currentGoLiveStage
    }
  }
}

const setupStubs = (serviceRole) => {
  cy.task('setupStubs', simpleStub(serviceRole))
}

const stubUserSuccessResponse = (serviceRoleBefore, serviceRoleAfter) =>
  [{
    name: 'getUserSuccessRepeatFirstResponseNTimes',
    opts: [{
      external_id: variables.userExternalId,
      service_roles: [serviceRoleBefore],
      repeat: 2
    }, {
      external_id: variables.userExternalId,
      service_roles: [serviceRoleAfter],
      repeat: 2
    }]
  }, {
    name: 'getGatewayAccountSuccess',
    opts: { gateway_account_id: variables.gatewayAccountId }
  }]

module.exports = {
  variables,
  buildServiceRoleForMerchantDetailsField,
  buildServiceRoleForGoLiveStage,
  simpleStub,
  stubWithGoLiveStage,
  stubGoLiveStageError,
  setupStubs,
  stubUserSuccessResponse
}