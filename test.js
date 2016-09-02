"use strict"

const { createMachine, become } = require('./index.js')
const assert = require('assert')

// BEGIN FIXTURES

const users = ['userFoo', 'userBar', 'userBaz']

const initReducer = (state = {error: null, users: []}, action) => {

    switch (action.type) {
    case 'FETCH_USERS':
        return Object.assign({}, state, {
            error: null,
            [become]: 'IN_PROGRESS'
    })
    default:
        return state
    }
}

const inProgressReducer = (state = {}, action) => {

    switch (action.type) {
    case 'FETCH_USERS_RESPONSE':
        return Object.assign({}, state, {
            error: null,
            users: action.payload.users,
            [become]: 'INIT'
        })
    case 'FETCH_USERS_TIMEOUT':
        return Object.assign({}, state, {
            error: 'timeout',
            [become]: 'INIT'
        })
    default:
        return state
    }
}

const fetchUsersReducer = createMachine({
    'INIT': initReducer,
    'IN_PROGRESS': inProgressReducer
})

// END FIXTURES

// BEGIN HELPERS

let state = undefined
let prevState = undefined

const test = (type, payload) => {
    prevState = state
    state = fetchUsersReducer(state, {type, payload})
    return test
}

test.expect = (expected, maybeMessage) => assert.deepEqual(state, expected, maybeMessage)

// END HELPERS

// run the reducer and go through several status transitions
// to test a typical scenario—making an API call

test('DUMMY').expect({
    error: null,
    status: 'INIT',
    users: []
}, 'Should set initial status to "INIT"')

test('FETCH_USERS_RESPONSE', {users})
    .expect(prevState, 'Should ignore messages when not handled by current status')

test('FETCH_USERS').expect({
    error: null,
    status: 'IN_PROGRESS',
    users: []
})

test('FETCH_USERS_TIMEOUT').expect({
    error: 'timeout',
    status: 'INIT',
    users: []
})

test('FETCH_USERS').expect({
    error: null,
    status: 'IN_PROGRESS',
    users: []
})

test('FETCH_USERS').expect(prevState)

test('FETCH_USERS_RESPONSE', {users}).expect({
    error: null,
    status: 'INIT',
    users
})

assert.throws(
    () => createMachine({}),
    err => err.message === 'reducersObject must have INIT reducer',
    'should error when reducersObject missing "INIT"'
)

console.log('success')