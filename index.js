"use strict"

var become = Symbol('become')

var createMachine = function(reducersObject) {
    var status = 'INIT'
    var currentReducer = reducersObject['INIT']
    if (!currentReducer) {
        throw new Error('reducersObject must have INIT reducer')
    }
    return function(state, action) {
        var nextState = currentReducer(state, action)
        if (nextState[become]) {
            status = nextState[become]
            currentReducer = reducersObject[status]
        }
        var nextStateWithStatus = Object.assign({}, state, nextState, {status: status})
        return nextStateWithStatus
    }
}

module.exports = {createMachine: createMachine, become: become}
