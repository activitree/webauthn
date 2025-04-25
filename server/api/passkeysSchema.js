import SimpleSchema from '@activitree/simpl-schema'

const PasskeySchema = new SimpleSchema({
  userId: String, // Meteor user id of the user
  // Created by `generateRegistrationOptions()` in Step 1
  webAuthnUserID: String,
  // A unique identifier for the credential
  id: String,
  // The public key bytes, used for subsequent authentication signature verification
  publicKey: String,
  // The number of times the authenticator has been used on this site so far
  counter: SimpleSchema.Integer,
  // How the browser can talk with this credential's authenticator
  transports: Array,
  'transports.$': String,
  // Whether the passkey is single-device or multi-device
  deviceType: String,
  // Whether the passkey has been backed up in some way
  backedUp: Boolean
})

export { PasskeySchema }
