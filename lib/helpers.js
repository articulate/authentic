exports.rename = (prevKey, nextKey) => obj => {
  const next = {}
  for (const key in obj) {
    if (key === prevKey) next[nextKey] = obj[prevKey]
    else next[key] = obj[key]
  }
  return next
}

exports.tapP = fn => val =>
  Promise.resolve(val).then(fn).then(() => val)
