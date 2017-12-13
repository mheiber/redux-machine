"use strict"

const { createStore } = require('redux')
const test = require('tape')
const { createMachine } = require('./index.js')

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

// run the reducer and go through several status transitions
// to test a typical scenario—making an API call

test('should transition between states', t => {

    let state = undefined
    let prevState = undefined
    const store = createStore(fetchUsersReducer, state)

    const expectState = (expected, maybeMessage) => t.deepEquals(state, expected, maybeMessage)

    const action = (type, payload) => {
        prevState = state
        store.dispatch({type, payload})
        state = store.getState()
    }

    action('DUMMY')
    expectState({
        status: 'INIT',
    }, 'Should set initial status to "INIT"')

    action('DUMMY AGAIN')
    t.equals(state, prevState, 'Should not change the state when an action is unhandled')

    action('FETCH_USERS_RESPONSE', {users})
    expectState(prevState, 'Should ignore messages when not handled by current status')

    action('FETCH_USERS')
    expectState({
        error: null,
        status: 'IN_PROGRESS'
    })

    action('FETCH_USERS_FAIL', 'timeout')
    expectState({
        error: 'timeout',
        status: 'INIT'
    })

    action('FETCH_USERS')
    expectState({
        error: null,
        status: 'IN_PROGRESS'
    })

    action('FETCH_USERS')
    expectState(prevState)

    action('FETCH_USERS_RESPONSE', {users})
    expectState({
        error: null,
        status: 'INIT',
        users
    })

    t.end()
})

test('should be able to pass an extraArgument to inner reducers', t => {
    const configReducer =  (state = {}, action) => state;
    const gameReducer = (state = {}, action, isMuted) => {
        switch (action.type) {
        case 'START':
            const audio = (isMuted === true) ? 'OFF' : 'ON'
            return Object.assign({}, state, {
                audio: audio
        })
        default:
            return state
        }
    }
    const innerReducer = (state = {}, action) => {
        const isMuted = state.config ? state.config.isMuted : undefined
        return {
          'game': gameReducer(state.game, action, isMuted),
          'config': configReducer(state.config, action)
        }
    }
    const fsmReducer = createMachine({
        'INIT': innerReducer
    });
    const store = createStore(fsmReducer, undefined)
    store.dispatch({
      type: 'START'
    })
    t.deepEquals(store.getState(), {
        status: 'INIT',
        game: {
          audio: 'ON'
        },
        config: {}
    }, 'Should turn game audio "ON" if isMuted !== true')

    const silentStore = createStore(fsmReducer, {
      config: {
        isMuted: true
      }
    })
    silentStore.dispatch({
      type: 'START'
    })
    t.deepEquals(silentStore.getState(), {
        status: 'INIT',
        game: {
          audio: 'OFF'
        },
        config: {
          isMuted: true
        }
    }, 'Should turn game audio "OFF" if isMuted === true')

    t.end()
})

test('should error on status not found', t => {
    let store = {status: 'STATUS_NOT_IN_CREATE_MACHINE'}
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
