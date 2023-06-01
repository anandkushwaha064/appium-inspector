import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, push } from 'connected-react-router';
import actions from '../actions';
import createRootReducer from '../reducers';

const history = createHashHistory();

const rootReducer = createRootReducer(history);

const configureStore = (initialState) => {
  const middleware = [];

  // Thunk Middleware
  middleware.push(thunk);

  // Logging Middleware - dev only
  if (process.env.NODE_ENV === 'development') {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({
      level: 'info',
      collapsed: true
    });

    middleware.push(logger);
  }

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
      actionCreators: {...actions, push}
    })
    : compose;

  // Apply Middleware & Compose Enhancers
  const enhancer = composeEnhancers(
    applyMiddleware(...middleware)
  );

  // Create Store
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept(
      '../reducers',
      () => store.replaceReducer(require('../reducers').default)
    );
  }

  return store;
};

export default { configureStore, history };
