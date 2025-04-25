import { Meteor } from 'meteor/meteor'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { toastShow } from '@act/toastr-component'

// 1. Get challenge from server
export async function signup (callback) {
  Meteor.callAsync('initRegister')
    .then(async options => {
      // console.log('my options here: ', options)

      // 2. Create passkey
      const registrationJSON = await startRegistration({ optionsJSON: options })
      console.log(registrationJSON)

      if (registrationJSON) {
        Meteor.callAsync('verifyRegister', registrationJSON, options)
          .then(verifyData => {
            if (verifyData.verified) {
              // 3. Save passkey in DB
              callback && callback(verifyData.cId)
            } else {
              console.log('Failed to register')
            }
          })
          .catch(err => console.log({ err }))
      }
    })
    .catch(err => console.log({ err }))
}

export async function login (callback, removePasskeyOnFailure, cId) {
  // 1. Get challenge from server
  Meteor.callAsync('initAuth', cId)
    .then(async options => {
      // console.log(cId, options)
      if (options === null) {
        removePasskeyOnFailure()
        toastShow(6000, 'We encountered an error!', 'We were unable to enable biometrics for this device. Let\'s try again!', 'error')
        return
      }

      // 2. Get passkey
      const authJSON = await startAuthentication({ optionsJSON: options })
      // 3. Verify passkey with DB
      Meteor.callAsync('verifyAuth', authJSON, options)
        .then(verifyData => {
          if (verifyData.verified) {
            callback && callback()
          } else {
            console.log('Failed to log in')
          }
        })
        .catch(err => console.log({ err }))
    })
    .catch(err => console.log({ err }))
}
