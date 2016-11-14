# redux-machine

![redux-machine](http://i63.tinypic.com/2igdbus_th.jpg)

*A tiny lib (16 lines) for creating state machines as swappable Redux reducers*

> This is the version of this library to use when your Redux store state is an [Immutable JS](https://facebook.github.io/immutable-js/) [Map](https://facebook.github.io/immutable-js/docs/#/Map). See also the [non-immutable-js version of redux-machine](https://github.com/mheiber/redux-machine).

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
        return state
                .set('error', null)
                .set('status', 'IN_PROGRESS')
    })
    default:
        return state
    }
}

const inProgressReducer = (state = {}, action) => {
    switch (action.type) {
    case 'FETCH_USERS_RESPONSE':
        return state.withMutations(map => {
            return map
                .set('error', null)
                .set('users', action.payload.users)
                .set('status', 'INIT')
        })
    case 'FETCH_USERS_FAIL':
        return state
                .set('error', action.payload.error)
                .set('status', 'INIT')
        return state
                .set('error', action.payload.error)
                .set('status', 'INIT')
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
    switch (state.get(status)) {
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

## Examples

[Cancellable Counter](https://github.com/mheiber/redux-funk-examples)

[Shopping Cart](https://github.com/mheiber/redux-funk-examples)

> These examples use the [non-immutable-js version](https://github.com/mheiber/redux-machine) of redux-machine.