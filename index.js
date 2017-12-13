"use strict"

var createMachine = function(reducersObject) {
    return function(state, action, extraArgument) {
      var status = (state && state.status) ? state.status : 'INIT'
      var reducer = reducersObject[status]
      if (!reducer) {
          throw new Error('reducersObject missing reducer for status ' + status)
      }
      const nextState = reducer(state, action, extraArgument)
      if (nextState === state) {
          return state
      }
      return Object.assign({}, nextState, {'status': nextState.status || status})
    }
}

module.exports = {createMachine: createMachine, become: 'status' /* for backwards compatibility */}
