"use strict"

var createMachine = function(reducersObject) {
    return function(state, action) {
        const nextState = state ? Object.assign({}, state) : {}
        nextState.status = nextState.status || 'INIT'
        var currentReducer = reducersObject[nextState.status]
        if (!currentReducer) {
            throw new Error('reducersObject missing reducer for status ' + nextState.status)
        }
        return currentReducer(nextState, action)
    }
}

module.exports = {createMachine: createMachine, become: 'status' /* for backwards compatibility */}
