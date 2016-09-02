# redux-machine
*A tiny library (19 lines) for creating state machines in Redux apps.*

redux-machine enables you to create [reducers](http://redux.js.org/docs/basics/Reducers.html) that can transition between different "statuses." These are likes states in a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine). The goal is for redux-machine to support complex workflows simply while keeping all state in the redux store. Keeping all state in the store is good because:

- redux-machine works with time-travel debugging. Time-travel debugging was the main [motivation for building redux itself](https://www.youtube.com/watch?v=xsSnOQynTHs).
- Debugging is easy because information is in one place (the store).
- A JSON dump of the current store should be enough for you to reproduce what any user sees.
- Statuses such are queryable by the user interface. This is helpful if you want to show things to the user such as loading spinners to indicate status

redux-saga and redux-observable also make it easy to create workflows in redux apps. They are more beautiful and powerful than redux-machine, but break the "all state is in the store" paradigm and therefore lack the advantages above.

## Install

`npm install redux-machine --save`

> redux-machine internally uses Object.assign and Symbol, which are ES2015 features. If you need to support older browsers, you can use a polyfill such as [core-js](https://github.com/zloirock/core-js#basic).

## API

- **`createMachine(reducerObject)`** returns a machine, which is itself a reducer

`reducerObject` is an object where the keys are statuses and the values are sub-reducers. For example, this code creates a reducer that acts like `initReducer` when the status is `INIT` and acts like `inProgressReducer` when the status is `IN_PROGRESS`:

```js
const fetchUsersReducer = createMachine({
    'INIT': initReducer,
    'IN_PROGRESS': inProgressReducer
})
```

`reducerObject` must have an `INIT` key. The value for the `INIT` key is the reducer for the starting status of the machine/reducer.

The reducer returned by `createMachine` adds a `STATUS` key to the store. That is, when the status is `INIT`, the value of `STATUS` is `INIT` and when the status is `IN_PROGRESS`, the value of `STATUS` is `IN_PROGRESS`. This is useful for debugging or for acting on the current status in the UI or in your API callers.

- **`become`** (symbol)
The reducers that are the values of `reducersObject` can use `become` to transition the machine/reducer to a different status. For example, the following code in `initReducer` transitions `fetchUsersReducer` to the `IN_PROGRESS` status when the ` ` action is dispatched. At that point, `fetchUsersReducer` will act like `inProgressReducer` and the value of `STATUS` changes to `IN_PROGRESS`:

```js
import { become } from 'redux-machine'

...
    switch (action.type) {
    case 'FETCH_USERS':
        return Object.assign({}, state, {
            error: null,
            [become]: 'IN_PROGRESS'
    })
    case default:
        return state
    }
```

> redux-machine's `become` is influenced by [Akka's `become`](http://doc.akka.io/docs/akka/snapshot/scala/actors.html#become-unbecome).

## Full Example

Suppose you are making an API call to fetch users, and want only one instance of this API call to happen at a time. You also want to communicate to the user the status of the API call: `INIT` (initial status, no call in progress) and `IN_PROGRESS`.

You can use redux-machine to have the following status transitions in your reducer:

- When the status is `INIT` and the action type is `FETCH_USERS`, the machine transitions to `IN_PROGRESS` status.
- When the status is `IN_PROGRESS` and the action type is `FETCH_USERS_RESPONSE` or `FETCH_USERS_TIMEOUT`, the machine transitions to the `INIT` (initial) status.

I'll walk through how to create the machine in this example. If you prefer to see all the code in one place, it's in `./test.js`.

### `import` redux-machine

```js
import { createMachine, become } = from './index.js'
```

### Create Reducers

Next, define a reducer for each status in the machine ('INIT' and 'IN_PROGRESS'):

```js
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
```

> The only special part of these reducers is how they use the `become` symbol, which I'll explain in the next section.

### Create the Machine

Here's how you can use the `createMachine` function to create a reducer from the `initReducer` and `inProgressReducer`:

```js
const fetchUsersReducer = createMachine({
    'INIT': initReducer,
    'IN_PROGRESS': inProgressReducer
})
```

> `fetchUsersReducer` is a normal [reducer](http://redux.js.org/docs/basics/Reducers.html) that you can use directly in your Redux app, with no need for special middleware.

`initReducer` is the value for `INIT`, so `createMachine` knows to start off acting like `initReducer`.

In the object provided to `createMachine`, the names of the keys matter because they are used within reducers for transitioning the machine/reducer between statuses. For example, the following code in `initReducer` says that when the action is of type `FETCH_USERS`, transition the machine to the `IN_PROGRESS` status:

```js
    switch (action.type) {
    case 'FETCH_USERS':
        return Object.assign({}, state, {
            error: null,
            [become]: 'IN_PROGRESS'
    })
    case default:
        return state
    }
```

> `become` is a symbol imported from redux-machine, not a string. See the `import` statement in the example above.

> This example does not include how to make the API calls. redux-machine is a tightly-focused library that does one thing. This leaves it open for you to use [redux-thunk](https://github.com/gaearon/redux-thunk), observables, [redux-saga](https://github.com/yelouafi/redux-saga), or [no library](http://stackoverflow.com/a/34599594/2482570) to perform asynchronous effects such as API calls.

