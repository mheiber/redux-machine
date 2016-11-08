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


const initReducerWithCustomStatus = (state = {}, action) => {
    switch (action.type) {
    case 'FETCH_USERS':
        return Object.assign({}, state, {
            error: null,
            my_custom_status: 'IN_PROGRESS'
    })
    default:
        return state
    }
}

const inProgressReducerWithCustomStatus = (state = {}, action) => {

    switch (action.type) {
    case 'FETCH_USERS_RESPONSE':
        return Object.assign({}, state, {
            error: null,
            users: action.payload.users,
            my_custom_status: 'INIT'
        })
    case 'FETCH_USERS_FAIL':
        return Object.assign({}, state, {
            error: action.payload,
            my_custom_status: 'INIT'
        })
    default:
        return state
    }
}


// END FIXTURES

// BEGIN HELPERS

const createDummyStore = function (reducer, initialState) {
  let state = initialState
  let prevState = state

  return {
    dispatch (type, payload) {
      prevState = state
      state = reducer(state, {type, payload})
    },
    expectState (expectedState, maybeMessage) {
      assert.deepEqual(state, expectedState, maybeMessage)
    },
    expectStateUnchanged (maybeMessage) {
      assert.deepEqual(state, prevState, maybeMessage)
    }
  }
}

// END HELPERS

// go through several status transitions
// to test a typical scenario—making an API call

const fetchUsersReducer = createMachine({
    'INIT': initReducer,
    'IN_PROGRESS': inProgressReducer
})

const store = createDummyStore(fetchUsersReducer)

store.dispatch('DUMMY')
store.expectState({
    status: 'INIT',
}, 'Should set initial status to "INIT"')

store.dispatch('FETCH_USERS_RESPONSE', {users})
store.expectStateUnchanged('Should ignore messages when not handled by current status')

store.dispatch('FETCH_USERS')
store.expectState({
    error: null,
    status: 'IN_PROGRESS'
})

store.dispatch('FETCH_USERS_FAIL', 'timeout')
store.expectState({
    error: 'timeout',
    status: 'INIT'
})

store.dispatch('FETCH_USERS')
store.expectState({
    error: null,
    status: 'IN_PROGRESS'
})

store.dispatch('FETCH_USERS')
store.expectStateUnchanged()

store.dispatch('FETCH_USERS_RESPONSE', {users})
store.expectState({
    error: null,
    status: 'INIT',
    users
})

assert.throws(
    () => {
        const reducer = createMachine({})
        const store = createDummyStore(reducer, {status: 'STATUS_NOT_IN_CREATE_MACHINE'})
        store.dispatch('DUMMY')
    },
    err => err.message === 'reducersObject missing reducer for status STATUS_NOT_IN_CREATE_MACHINE',
    'should error when status not found'
)

const reducerWithCustomStatusSupport = createMachine(
  {
    'INIT': initReducerWithCustomStatus,
    'IN_PROGRESS': inProgressReducerWithCustomStatus
  },
  (state) => state.my_custom_status,
  (state, newStatus) => Object.assign({}, state, {my_custom_status: newStatus})
)

const storeWithCustomStatus = createDummyStore(reducerWithCustomStatusSupport)

storeWithCustomStatus.dispatch('DUMMY')
storeWithCustomStatus.expectState({
    my_custom_status: 'INIT',
}, 'Should set initial status to "INIT"')

storeWithCustomStatus.dispatch('FETCH_USERS_RESPONSE', {users})
storeWithCustomStatus.expectStateUnchanged('Should ignore messages when not handled by current status')

storeWithCustomStatus.dispatch('FETCH_USERS')
storeWithCustomStatus.expectState({
    error: null,
    my_custom_status: 'IN_PROGRESS'
})

storeWithCustomStatus.dispatch('FETCH_USERS_FAIL', 'timeout')
storeWithCustomStatus.expectState({
    error: 'timeout',
    my_custom_status: 'INIT'
})

storeWithCustomStatus.dispatch('FETCH_USERS')
storeWithCustomStatus.expectState({
    error: null,
    my_custom_status: 'IN_PROGRESS'
})

storeWithCustomStatus.dispatch('FETCH_USERS')
storeWithCustomStatus.expectStateUnchanged()

storeWithCustomStatus.dispatch('FETCH_USERS_RESPONSE', {users})
storeWithCustomStatus.expectState({
    error: null,
    my_custom_status: 'INIT',
    users
})


console.log('success')
