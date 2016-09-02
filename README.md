# redux-machine

## Install

`npm install redux-machine --save`

## What

redux-machine enables you to create [reducers](http://redux.js.org/docs/basics/Reducers.html) that can transition between different "statuses." These are likes states in a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine).

For example, suppose you are making an API call to fetch users, and want only one instance of this API call to happen at a time. You also want to communicate to the user the status of the API call: **'INIT'** (initial status, no call in progress) and **'IN_PROGRESS'**.

You could use redux-machine to have the following status transitions in your reducer:

status:INIT        -- action:FETCH_USERS          ---> status:IN_PROGRESS
status:IN_PROGRESS -- action:FETCH_USERS_RESPONSE ---> status:INIT
status:IN_PROGRESS -- action:FETCH_USERS_TIMEOUT  ---> status:INIT

This is a very simple example, but it's easy to see how one could add more statuses and transitions to model statuses like FETCH_USERS_RETRY and FETCH_USERS_ERROR.
