"use strict"

var createMachine = function(reducersObject) {
    return function(state, action) {
      if (!state.get || !state.set) {
        throw new Error(
          'Expected state to be an ImmutableJS Map.'
          + ' If your state is a plain JS object, use redux-machine instead')
      }
      var status = (state && state.get('status')) ? state.get('status') : 'INIT'
      var reducer = reducersObject[status]
      if (!reducer) {
          throw new Error('reducersObject missing reducer for status ' + status)
      }
      const nextState = reducer(state, action)
      return nextState.set('status', nextState.get('status') || status)
    }
}

module.exports = {createMachine: createMachine}
