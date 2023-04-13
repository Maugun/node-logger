import logger from '../../lib/esm/index.js'

logger.setNamespaces('namespace:*')
logger.setLevel('debug')
//logger.setOutput(logger.outputs.json)

const log = logger.createLogger('namespace:subNamespace')
log.debug('ctxId', 'Will be logged', { someData: 'someValue', someData2: 'someValue' })