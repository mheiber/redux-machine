"use strict"

var defaultGetStatus = function (state) {
    return state.status
}

var defaultSetStatus = function (state, status) {
    return Object.assign({}, state, {'status': status})
}

var createMachine = function(reducersObject, getStatus=defaultGetStatus, setStatus=defaultSetStatus) {
    return function(state, action) {
      var status = (state && getStatus(state)) ? getStatus(state) : 'INIT'
      var reducer = reducersObject[status]
      if (!reducer) {
          throw new Error('reducersObject missing reducer for status ' + status)
      }
      const nextState = reducer(state, action)
      return setStatus(nextState, getStatus(nextState) || status)
    }
}

module.exports = {createMachine: createMachine, become: 'status' /* for backwards compatibility */}
