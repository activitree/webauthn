import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { Meteor } from 'meteor/meteor'
import Passkeys from './api/passkeys'
const RP_ID = 'apps.activitree.com' // Meteor.isProduction ? 'apps.activitree.com' : 'localhost'
const CLIENT_URL = 'https://apps.activitree.com' // Meteor.isProduction ? 'https://apps.activitree.com' : 'http://localhost:3600'

Meteor.methods({
  initRegister: async function () {
    if (!this.userId) { throw new Meteor.Error('not-authorized') }
    const passkeys = await Passkeys.find({ userId: this.userId }, { fields: { id: 1, transports: 1, _id: 0 } }).fetchAsync()
    const options = await generateRegistrationOptions({
      rpName: 'Activitree Business',
      rpID: RP_ID,
      origin: CLIENT_URL,
      userName: '',
      // attestationType: 'none',
      excludeCredentials: passkeys.map(passkey => ({
        id: passkey.id,
        transports: passkey.transports
      })),
      authenticatorSelection: {
        // Defaults
        residentKey: 'preferred',
        userVerification: 'preferred',
        // Optional
        authenticatorAttachment: 'platform'
      }
    })

    return options
  },
  verifyRegister: async function (registrationJSON, initialOptions) {
    if (!this.userId) { throw new Meteor.Error('not-authorized') }
    // console.log(registrationJSON, initialOptions)
    const verification = await verifyRegistrationResponse({
      response: { ...registrationJSON, ...initialOptions },
      expectedChallenge: initialOptions.challenge, // , only if I use a custom challenge
      expectedOrigin: CLIENT_URL,
      expectedRPID: RP_ID
    })

    if (verification.verified) {
      const { registrationInfo } = verification || {}
      const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo

      const newPasskey = {
        // `user` here is from Step 2
        userId: this.userId,
        // Created by `generateRegistrationOptions()` in Step 1
        webAuthnUserID: initialOptions.user.id,
        // A unique identifier for the credential
        id: credential.id,
        // The public key bytes, used for subsequent authentication signature verification
        publicKey: credential.publicKey,
        // The number of times the authenticator has been used on this site so far
        counter: credential.counter,
        // How the browser can talk with this credential's authenticator
        transports: credential.transports,
        // Whether the passkey is single-device or multi-device
        deviceType: credentialDeviceType,
        // Whether the passkey has been backed up in some way
        backedUp: credentialBackedUp,
        createdAt: new Date()
      }

      Passkeys.insertAsync(newPasskey)
        .then(() => {
          Meteor.users.updateAsync(this.userId, {
            $addToSet: {
              'settings.biz.biometrics': credential.id
            }
          })
        })

      return {
        verified: verification.verified,
        cId: credential.id
      }
    } else {
      console.log('failed')
    }
  },

  initAuth: async function (cId) {
    if (!this.userId) { throw new Meteor.Error('not-authorized') }
    const hasKey = (await Passkeys.findOneAsync({ userId: this.userId, id: cId }, { fields: { _id: 1 } }))?._id

    if (!hasKey) {
      await Meteor.users.updateAsync(this.userId, {
        $pull: {
          'settings.biz.biometrics': cId
        }
      })
      return null // it means that something went wrong with the registration and I have a cId on the client but could not save a key on the server.
    }

    const passkeys = await Passkeys.find({ userId: this.userId }, { fields: { id: 1, transports: 1, counter: 1, _id: 0 } }).fetchAsync()
    const options = await generateAuthenticationOptions({ rpID: RP_ID, allowCredentials: passkeys })

    return options
  },
  verifyAuth: async function (authJSON, authOptions) {
    if (!this.userId) { throw new Meteor.Error('not-authorized') }
    const passkey = await Passkeys.findOneAsync({ userId: this.userId, id: authJSON.id }, { fields: { publicKey: 1, transports: 1, counter: 1, _id: 0 } })
    // console.log('passkey: ', passkey)
    // console.log(
    //   'verifyAuth',
    //   { authJSON },
    //   { authOptions }
    // )
    // console.log('za object: ', {
    //   credentialID: authJSON.id,
    //   expectedChallenge: authOptions.challenge, // , only if I use a custom challenge
    //   expectedOrigin: CLIENT_URL,
    //   expectedRPID: RP_ID,
    //   credentialPublicKey: passkey?.publicKey,
    //   counter: passkey?.counter,
    //   transports: passkey?.transports
    // })
    const verification = await verifyAuthenticationResponse({
      response: { ...authJSON, ...authOptions },
      expectedChallenge: authOptions.challenge, // , only if I use a custom challenge
      expectedOrigin: CLIENT_URL,
      expectedRPID: RP_ID,
      credential: {
        id: authJSON.id,
        publicKey: passkey?.publicKey,
        counter: passkey?.counter,
        transports: passkey?.transports
      }
    })

    // console.log({ verification })
    const { verified } = verification
    if (verified) {
      await Passkeys.updateAsync({ userId: this.userId, id: authJSON.id }, {
        $set: { counter: verification.authenticationInfo?.newCounter }
      })
    }
    return { verified }
  },
  // I keep track of enabled biometrics on the user but I don't really use this info at the moment.
  // the cId is kept in the localStorage on the device and this is how I know if a device is enabled or not.
  toggleBiometrics: async function (cId) {
    if (!this.userId) { throw new Meteor.Error('not-authorized') }
    await Passkeys.removeAsync({ userId: this.userId, id: cId })

    await Meteor.users.updateAsync(this.userId, {
      $pull: {
        'settings.biz.biometrics': cId
      }
    })
    return true
  }
})
