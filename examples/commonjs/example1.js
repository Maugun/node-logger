const logger = require('../../lib/commonjs/index.js')

logger.setNamespaces('root:*')
logger.setLevel('debug')

const log = logger.createLogger('root:testing')
log.debug('sample message', {
    foo: 'bar',
})