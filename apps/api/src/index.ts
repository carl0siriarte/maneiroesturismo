import { ClusterApplication } from './app/cluster.js'
import { applicationFactory } from './app/factory.js'

const DEV = !import.meta.env.PROD

if (!DEV) {
  const clusterApp = new ClusterApplication(applicationFactory)
  clusterApp.run()
}

export const devServer = DEV ? applicationFactory() : undefined
