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

export default actionFlow
