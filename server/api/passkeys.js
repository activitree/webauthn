import { Mongo } from 'meteor/mongo'
import { accountsUriDriver } from './_connections'

const Passkeys = new Mongo.Collection('passkeys', accountsUriDriver)

Passkeys.createIndexAsync({ userId: 1 })

export default Passkeys
