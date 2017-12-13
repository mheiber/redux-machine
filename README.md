# redux-machine

![redux-machine](http://i63.tinypic.com/2igdbus_th.jpg)

*A tiny lib (12 lines) for creating state machines as swappable Redux reducers*

> If you are using [Immutable JS](https://facebook.github.io/immutable-js/) in your stores, see [redux-machine-immutable](https://github.com/mheiber/redux-machine-immutable).

redux-machine enables you to create [reducers](http://redux.js.org/docs/basics/Reducers.html) that can transition between different "statuses." These are likes states in a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine). The goal is for redux-machine to support complex workflows simply while keeping all state in the redux store. Keeping all state in the store is good because:

- redux-machine works with time-travel debugging. Time-travel debugging was the main [motivation for building redux itself](https://www.youtube.com/watch?v=xsSnOQynTHs).
- Debugging is easy because information is in one place (the store).
- Statuses such are queryable by the user interface. This is helpful if you want to show things to the user such as loading spinners to indicate status

## Install

`npm install redux-machine --save`

> redux-machine internally uses Object.assign, which is an ES2015 feature. If you need to support older browsers, you can use a polyfill such as [core-js](https://github.com/zloirock/core-js#basic).

## How to Use

This is the entire API for redux-machine:

```js
// entire API, no middleware required
import { createMachine } = from './index.js'

const fetchUsersReducer = createMachine({
    'INIT': initReducer,
    'IN_PROGRESS': inProgressReducer
})
```

The reducer returned by `createMachine` will act like `initReducer` when its status is `INIT` and will act like `inProgressReducer` when the status is `IN_PROGRESS`. If the store's `state.status` is undefined, the reducer for `INIT` is used (so it's a good idea to provide a reducer for the `INIT` status).

`initReducer` and `inProgressReducer` can do status transitions by setting `state.status`:

```js
const initReducer = (state = {error: null, users: []}, action) => {
    switch (action.type) {
    case 'FETCH_USERS':
        return Object.assign({}, state, {
            error: null,
            // transition to a different status!
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
            // transition to a different status!
            status: 'INIT'
        })
    case 'FETCH_USERS_FAIL':
        return Object.assign({}, state, {
            error: action.payload.error,
            // transition to a different status!
            status: 'INIT'
        })
    default:
        return state
    }
}
```

The example above defines the following state machine:

![status machine for the api-calling example](http://oi67.tinypic.com/qz57qd.jpg)

In words:
- When the status is `INIT` and the action type is `FETCH_USERS`, the machine transitions to `IN_PROGRESS` status.
- When the status is `IN_PROGRESS` and the action type is `FETCH_USERS_RESPONSE` or `FETCH_USERS_FAIL`, the machine transitions to the `INIT` (initial) status.

## Making Finite State Machine Reducers without a Library

You don't need redux-machine, since you can accomplish almost the same thing as in the example above by defining `fetchUsersReducer` as follows:

```js
const fetchUsersReducer = (state, action) => {
    switch (state.status) {
    case 'INIT':
        return initReducer(state, action)
    case 'IN_PROGRESS':
        return inProgressReducer(state, action)
    default:
        return initReducer(state, action)
    }
}
```

The (marginal) advantages of using redux-machine over just using the FSM pattern is that you can more clearly express intent and write slightly less code.

## Supporting an Extra Argument

redux-machine supports to passing an extra argument to state reducers, for cases where a state reducer requires [a third argument for other state it depends on](https://github.com/reactjs/redux/blob/master/docs/faq/Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers).

## Asynchronous Effects

redux-machine doesn't prescribe a way of handling asynchronous effects such as API calls. This leaves it open for you to use [no async effects library](http://stackoverflow.com/a/34599594/2482570), [redux-loop](https://github.com/redux-loop/redux-loop), [redux-thunk](https://github.com/gaearon/redux-thunk), [redux-saga](https://github.com/yelouafi/redux-saga), [redux-funk](https://github.com/mheiber/redux-funk) or [anything else](https://github.com/markerikson/redux-ecosystem-links/blob/master/side-effects.md).

## Examples

See the [Redux Funk Examples repo](https://github.com/mheiber/redux-funk-examples) for examples using redux-machine and [redux-funk](https://github.com/mheiber/redux-funk):

- [Shopping Cart Example](https://github.com/mheiber/redux-funk-examples/blob/master/examples/shopping-cart/src/reducers/cart.js#L62)

- [Cancellable Counter Example](https://github.com/mheiber/redux-funk-examples/blob/master/examples/cancellable-counter/src/reducers/counter.js#L50)

See the [Redux Saga Examples](https://github.com/yelouafi/redux-saga/tree/master/examples) for comparison.
