import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'

const options = '?retryWrites=true' +
  '&maxIdleTimeMS=5000' +
  '&maxPoolSize=30' +
  '&readConcernLevel=majority' +
  '&readPreference=secondaryPreferred' +
  '&w=majority' +
  '&heartbeatFrequencyMS=15000'

const usersUser = process.env.MONGO_USERS_USER
const usersPassword = process.env.MONGO_USERS_PASS
const usersDomain = process.env.MONGO_USERS_DOMAIN

const localConnections = { uriAccounts: 'mongodb://127.0.0.1:27017/_accounts' } // or the default MongoDB port (Meteor port + 1)

const liveConnections = { uriAccounts: `mongodb+srv://${usersUser}:${usersPassword}@${usersDomain}${options}` }

const accountsUri = Meteor.isProduction ? liveConnections.uriAccounts : localConnections.uriAccounts
export const accountsUriDriver = {
  _driver: new MongoInternals.RemoteCollectionDriver(accountsUri, {})
}
