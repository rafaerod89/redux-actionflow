# Redux actionFlow

This module works in a really particular scenario on the React - Redux environment, but if you find yourself in this situation, it will help you a lot on managing the flow.

Usually when fetching data using React and Redux for a view, you would need:
  * A Component to render the data.
  * A Container that asks for the data.
  * A Provider from which you will be fetching the data.
  * An Action that gets fired when the data is available so redux can save it.
  * A Reducer to actually save that data on your store.
  * And a store to finally store the data and make it persistent in your session.

There are multiple sources from which you can fetch the data, but let's set our scenario ->
  * You're using a `Promise` based library for making HTTP Requests.
  * You want to control the Fetch Flow and that means:
    * You want to know when the Fetch starts so you can display a loader.
    * You want to know when the Fetch ends successfully so you can hide the loader and display the data.
    * You want to know when the Fetch ends with errors so you can hide the loader and display the errors.
  * You want this Flow to be as ease, organized, reusable and manageable as possible. **Meaning: You know KISS and absolutely love it.**

Now, if you're up against that scenario then we have a solution for you.


This solution is based on an entry (issue) on redux project. If you want to dig a little deeper into the beginning of this middleware you can check it out in here -> https://github.com/reactjs/redux/issues/99#issuecomment-112198579

The idea of this package is pretty much the same, so our goal by writing it was:
  * **Make this solution available to anyone who need it.** We think that by only having it as a comment on a issue of another project it might not reach out as it should.
  * **Add new features.** We keep the `Promise` behavior of the actions we fire but also add a `Promise` behavior to the actual actions that are finally delivered by this Middleware only add it a `Promise` behavior not.
  * **Add actual examples of the Middleware and of our 'upgrades'.**



Redux Middleware for handling promises action flow.
----

Remember what we said you would usually need when fetching data using React and Redux for a view? Lets have an example where you can see all the magic:

  * Set `actionFlow` to work with your store.
  * Call only one action and it fires the hole fetch event (controlling the entire flow).
  * Show loaders, errors and finally display the data.
  * Keep the project organized and manageable.



Containers & Components
----


### App main Layout Component

Our example has a `app.jsx` main layout where we keep two main features:
* AppPanel: Our main container
* All the common components that are rendered, for example, the page `Helmet`, a shared header () and footer, and finally a `SharedMessage` component used to display fixed status messages in the app.

```
class App extends Component {
  render () {
    return (
      <section>
        <Helmet title={Redux actionFlow Example} />

        <LayoutHeaderComponent/>

        <SharedMessage />

        <AppPanel />

        <LayoutFooterComponent />

      </section>
    )
  }
}
```




### SharedMessage Container

Let's suppose we have `Message` component that given this information structure:

```
{
  title: string,
  message: string,
  isVisible: boolean
}
```

It's shown and hidden, and the text can be modified.

To make it reusable and global in the app, this fixed status message component is connected and handled by the store using this `SharingMessage` component.

```
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import SharedMessageActions from 'src/common/actions/sharedMessage'

class SharedMessage extends Component {
  render () {
    return (
      <Message {...this.props.sharedMessage} />
    )
  }
}

export default connect((store) => ({
  sharedMessage: store.sharedMessage
}))(SharedMessage)
```




### Main Container

```
import SharedMessageActions from 'src/common/actions/sharedMessage'
import DataActions from 'src/common/actions/data'
import DisplayDataComponent from 'src/common/components/displayDataComponent'

class AppPanel extends Component {
  componentDidMount () {
    this.fetchDataAction()
  }

  render () {
    const { fetchDataProgress, data } = this.props
    const { loading } = fetchDataProgress

    return (
      <main>
        {loading && <h3>Fetching Data</h3>}

        <DisplayDataComponent
          data={data} />
      </main>
    )
  }
}

function mapStateToProps (store) {
  return {
    data: store.data.data,
    fetchDataProgress: store.data.fetchDataProgress
  }
}

function mapDispatchToProps (dispatch) {
  return {
    fetchDataAction: () => (
      dispatch(DataActions.fetchData())
      .then(() => {
        dispatch(SharedMessageActions.update({
          title: 'Fetch Data Action',
          message: 'Completed successfully',
          isVisible: true
        }))
      })
      .catch((err) => {
        dispatch(SharedMessageActions.update({
          title: 'Fetch Data Action',
          message: `Error: ${err}`,
          isVisible: true
        }))
      })
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppPanel)
```




### Display Data Component

```
class DisplayDataComponent extends Component {
  render () {
    const { data } = this.props
    return (
      <div>
        <p>{data}</p>
      </div>
    )
  }
}

export default DisplayDataComponent
```







Actions
----


### SharedMessage Actions

As you can see here, the `promise` value passed to `actionFlow` is not necessary a HTTP Request, it can be any kind of `Promise`. In this case we use a custom promise to handle the lifeTime of a modal window.

```
const sharedMessageActions = {
  delayedCloseTimeout: null,

  update: function (value) {
    return {
      type: SHARED_MESSAGE_UPDATE,
      value: value
    }
  },

  close: function () {
    return {
      type: SHARED_MESSAGE_CLOSE
    }
  },

  delayedClose: function (delay) {
    return {
      types: [SHARED_MESSAGE_CLOSE_START, SHARED_MESSAGE_CLOSE, SHARED_MESSAGE_CLOSE_FAIL],
      promise: new Promise((resolve) => {
        clearTimeout(this.delayedCloseTimeout)
        this.delayedCloseTimeout = setTimeout(resolve, delay)
      })
    }
  }
}

export default sharedMessageActions
```




### Data Actions

```
const dataActions = {
  fetchData: function () {
    return {
      types: [DATA_FETCH_START, DATA_FETCH_SUCCESS, DATA_FETCH_FAIL],
      promise: dataProvider.fetchData({})
    }
  }
}

export default dataActions
```







Provider
----

```
const dataProvider = {
  fetchData: function ({req}) {
    .
    .
    .
  }
}

export default dataProvider
```







Reducers
----


### Reducer - Root

```
import { combineReducers } from 'redux'
import data from './data'
import sharedMessage from './sharedMessage'

export default combineReducers({
  data,
  sharedMessage
})
```




### SharedMessage Reducer

```
const initialState = {
  isVisible: false
}

const sharedMessageReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHARED_MESSAGE_UPDATE: {
      return Object.assign({}, action.value)
    }
    case SHARED_MESSAGE_CLOSE: {
      return Object.assign({}, state, {
        isVisible: false
      })
    }
    default:
      return state
  }
}

export default sharedMessageReducer
```




### Data Reducer

```
const initialState = {
  data: '',
  fetchDataProgress: {
    loading: false,
    errors: null
  }
}

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case DATA_FETCH_START: {
      return Object.assign({}, state, {
        fetchDataProgress: {
          loading: true,
          error: null
        }
      })
    }
    case DATA_FETCH_FAIL: {
      return Object.assign({}, state, {
        fetchDataProgress: {
          loading: false,
          error: action.error
        }
      })
    }
    case DATA_FETCH_SUCCESS: {
      return Object.assign({}, state, {
        fetchDataProgress: {
          loading: false,
          error: null
        },
        data: action.value
      })
    }

    default:
      return state
  }
}

export default dataReducer
```







Store
----

```
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from './reducers/root'

function actionFlow () {
  return (next) => (action) => {
    const { promise, types, ...rest } = action
    if (!promise) {
      return next(action)
    }

    const [REQUEST, SUCCESS, FAILURE] = types
    next({ ...rest, type: REQUEST })
    return promise.then(
      (value) => next({ ...rest, value, type: SUCCESS }),
      (error) => {
        next({ ...rest, error, type: FAILURE })
        throw error
      }
    )
  }
}

const composeEnhancers = (typeof window !== 'undefined') || compose

export default function configureStore (initialState) {
  return createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(actionFlow)))
}
```
