"use strict"

const { createMachine } = require('./index.js')
const assert = require('assert')

// BEGIN FIXTURES

const users = ['userFoo', 'userBar', 'userBaz']

const initReducer = (state = {}, action) => {
    switch (action.type) {
    case 'FETCH_USERS':
        return Object.assign({}, state, {
            error: null,
            status: 'IN_PROGRESS'
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
            status: 'INIT'
        })
    case 'FETCH_USERS_FAIL':
        return Object.assign({}, state, {
            error: action.payload,
            status: 'INIT'
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

const action = (type, payload) => {
    prevState = state
    state = fetchUsersReducer(state, {type, payload})
}

const expect = (expected, maybeMessage) => assert.deepEqual(state, expected, maybeMessage)

// END HELPERS

// run the reducer and go through several status transitions
// to test a typical scenario—making an API call

action('DUMMY')
expect({
    status: 'INIT',
}, 'Should set initial status to "INIT"')

action('FETCH_USERS_RESPONSE', {users})
expect(prevState, 'Should ignore messages when not handled by current status')

action('FETCH_USERS')
expect({
    error: null,
    status: 'IN_PROGRESS'
})

action('FETCH_USERS_FAIL', 'timeout')
expect({
    error: 'timeout',
    status: 'INIT'
})

action('FETCH_USERS')
expect({
    error: null,
    status: 'IN_PROGRESS'
})

action('FETCH_USERS')
expect(prevState)

action('FETCH_USERS_RESPONSE', {users})
expect({
    error: null,
    status: 'INIT',
    users
})

assert.throws(
    () => {
        let store = {status: 'STATUS_NOT_IN_CREATE_MACHINE'}
        const reducer = createMachine({})
        store = reducer(store, {type: 'DUMMY'})

    },
    err => err.message === 'reducersObject missing reducer for status STATUS_NOT_IN_CREATE_MACHINE',
    'should error when status not found'
)

console.log('success')