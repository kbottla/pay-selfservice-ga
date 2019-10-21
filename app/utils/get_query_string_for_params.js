'use strict'

const querystring = require('querystring')
const _ = require('lodash')
const dates = require('./dates.js')

function getQueryStringForParams (params = {}, removeEmptyParams = false, flattenCardBrandsParam = false) {
  let queryStrings = {
    reference: params.reference,
    email: params.email,
    cardholder_name: params.cardholderName,
    last_digits_card_number: params.lastDigitsCardNumber,
    card_brand: params.brand,
    from_date: dates.fromDateToApiFormat(params.fromDate, params.fromTime),
    to_date: dates.toDateToApiFormat(params.toDate, params.toTime),
    page: params.page || 1,
    display_size: params.pageSize || 100
  }

  if (params.payment_states) {
    queryStrings.payment_states = params.payment_states instanceof Array ? params.payment_states.join(',') : params.payment_states
  }
  if (params.refund_states) {
    queryStrings.refund_states = params.refund_states instanceof Array ? params.refund_states.join(',') : params.refund_states
  }
  if (flattenCardBrandsParam) {
    queryStrings.card_brands = params.brand instanceof Array ? params.brand.join(',') : params.brand
    delete queryStrings.card_brand
  }

  if (removeEmptyParams) {
    queryStrings = _.pickBy(queryStrings, _.identity)
  }

  return querystring.stringify(queryStrings)
}

module.exports = getQueryStringForParams
