"use strict"

function createMachine(lifecycleHooks) {
  const defaultLifecycleHooks = {
    getStatus:(state,initialStatus)=>(state && state.status) || initialStatus,
    getReducer:(reducersObject,status)=>{},
    getNextState:(state,nextState,status)=>state === nextState ? state : Object.assign({status}, nextState)
  };
  const {getNextState, getStatus, getReducer} = Object.assign(defaultLifecycleHooks, lifecycleHooks);
  const INIT = 'INIT';
  return function stateMachine(state, action){
    const status = getStatus(state, INIT);
    const reducer = getReducer(status);
    if(!isFunction(reducer)){invalidReducerError(status);}
    return getNextState(state, reducer(state, action), status);
  }
}

function invalidTypeError(status){throw new Error(`Invalid reducer for ${status}. It must be a function.`);}
function isFunction(arg){return typeof arg === 'function';}

module.exports = {createMachine: createMachine, become: 'status' /* for backwards compatibility */}
