const DEFAULT_COUNT = 20

const MAX_COUNT = 100

function paginateOffset(query, cfg = {}, opts = {}) {
  const {
    maxCount = MAX_COUNT
  } = cfg

  const {
    count = DEFAULT_COUNT,
    index = 0
  } = opts

  const limit = Math.min(count || maxCount, maxCount)
  return query.limit(limit).offset(index * limit)
}

function paginateKeyset(query, cfg = {}, opts = {}) {
  const {
    maxCount = MAX_COUNT,
    key = 'id'
  } = cfg

  const {
    count = DEFAULT_COUNT,
    current = 0,
    next = true
  } = opts

  const limit = Math.min(count || maxCount, maxCount)
  const [op, dir] = next ? ['>', 'asc'] : ['<', 'desc']
  return query.where(key, op, current).orderBy(key, dir).limit(limit)
}

function paginate(query, cfg = {}, opts = {}) {
  const {
    page = true
  } = opts

  return page ? paginateOffset(query, cfg, opts) : paginateKeyset(query, cfg, opts)
}

module.exports = {
  DEFAULT_COUNT,
  MAX_COUNT,
  paginateOffset,
  paginateKeyset,
  paginate
}
