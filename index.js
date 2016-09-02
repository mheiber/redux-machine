"use strict"

const become = Symbol('become')

const createMachine = reducersObject => {
    let status = 'INIT'
    let currentReducer = reducersObject['INIT']
    if (!currentReducer) {
        throw new Error('reducersObject must have INIT reducer')
    }
    return (state, action) => {
        const nextState = currentReducer(state, action)
        if (nextState[become]) {
            status = nextState[become]
            currentReducer = reducersObject[status]
        }
        const nextStateWithStatus = Object.assign({}, state, nextState, {status})
        return nextStateWithStatus
    }
}

module.exports = {createMachine, become}
