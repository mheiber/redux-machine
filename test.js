"use strict"

const { createStore } = require('redux')
const test = require('tape')
const { createMachine } = require('./index.js')
const { Map, List } = require('immutable')

// BEGIN FIXTURES

const users = List(['userFoo', 'userBar', 'userBaz'])

const initReducer = (state = Map(), action) => {
    switch (action.type) {
    case 'FETCH_USERS':
        return state
                .set('error', null)
                .set('status', 'IN_PROGRESS')
    default:
        return state
    }
}

const inProgressReducer = (state = Map(), action) => {

    switch (action.type) {
    case 'FETCH_USERS_RESPONSE':
        return state.withMutations(map => {
            map
                .set('error', null)
                .set('users', action.payload.users)
                .set('status', 'INIT')
        })
    case 'FETCH_USERS_FAIL':
        return state
                .set('error', action.payload)
                .set('status', 'INIT')
    default:
        return state
    }
}

const fetchUsersReducer = createMachine({
    'INIT': initReducer,
    'IN_PROGRESS': inProgressReducer
})

// END FIXTURES

// run the reducer and go through several status transitions
// to test a typical scenario—making an API call

test('should transition between states', t => {

    let state = Map()
    let prevState = undefined
    const store = createStore(fetchUsersReducer, state)

    const expectState = (expected, maybeMessage) => t.deepEquals(state.toJS(), expected.toJS(), maybeMessage)

    const action = (type, payload) => {
        prevState = state
        store.dispatch({type, payload})
        state = store.getState()
    }

    action('DUMMY')
    expectState(Map({
        status: 'INIT',
    }), 'Should set initial status to "INIT"')

    action('FETCH_USERS_RESPONSE', {users})
    expectState(prevState, 'Should ignore messages when not handled by current status')

    action('FETCH_USERS')
    expectState(Map({
        error: null,
        status: 'IN_PROGRESS'
    }))

    action('FETCH_USERS_FAIL', 'timeout')
    expectState(Map({
        error: 'timeout',
        status: 'INIT'
    }))

    action('FETCH_USERS')
    expectState(Map({
        error: null,
        status: 'IN_PROGRESS'
    }))

    action('FETCH_USERS')
    expectState(prevState)

    action('FETCH_USERS_RESPONSE', {users})
    expectState(Map({
        error: null,
        status: 'INIT',
        users
    }))

    t.end()
})

test('should error on status not found', t => {
    let store = Map({status: 'STATUS_NOT_IN_CREATE_MACHINE'})
    const reducer = createMachine({})
    let error
    try {
        reducer(store, {type: 'DUMMY'})
    }
    catch(err) {
        error = err
    }

    t.equals(
        error.message,
        'reducersObject missing reducer for status STATUS_NOT_IN_CREATE_MACHINE'
    )

    t.end()
})

test('should error when plain JS object used for state', t => {
    let error
    const reducer = createMachine({})
    try {
        reducer({}, {type: 'DUMMY'})
    }
    catch(err) {
        error = err
    }

    t.equals(
        error.message,
        'Expected state to be an ImmutableJS Map.'
        + ' If your state is a plain JS object, use redux-machine instead'
    )

    t.end()   
})
