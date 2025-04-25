// Uses React with MUI 7
// toastShow is a notification library based on react-hot-toast

// Check the image Enable Biometric Lock.jpg Initially, the option is offered and disabled. On click, the authentication flow starts, and after authentication, the color
// changes to green. Every time the app comes in focus, the user is prompted for fingerprint/face recognition or other biometrics.

import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined'
import { toastShow } from '@act/toastr-component'
import { signup } from 'meteor/activitree:accounts-webauthn'
import ListItemText from '@mui/material/ListItemText'
import LogoutTwoToneIcon from '@mui/icons-material/LogoutTwoTone'
// import { toggleBiometrics } from '../../../redux/actions/handlers/persistent_settings' // use your own state such as React Context
import { useDispatch, useSelector } from 'react-redux'

// A Redux action to toggle biometrics on or off
export const TOGGLE_BIOMETRICS = 'TOGGLE_BIOMETRICS'
export const toggleBiometrics = ({ passkey, set }) => { // options are set or remove as boolean
  return dispatch => {
    if (set) {
      dispatch({
        type: TOGGLE_BIOMETRICS,
        payload: passkey
      })
    } else {

      Meteor.callAsync('toggleBiometrics', passkey)
      .then(() => {
        dispatch({
          type: TOGGLE_BIOMETRICS,
          payload: null
        })
      })
    }
  }
}



export default function BiometricsAndLogout ({ setOpenSignOutDialog }) {
  const dispatch = useDispatch()
  const passkey = useSelector(({ persist }) => persist?.passkey) // Biometrics passkey stored locally in Redux. This is persisted in IndexedDB.
  const connected = useSelector(({ user }) => user.connected) // from Redux, true if connected to Meteor server
  const isIOS = useSelector(({ user }) => user?.isIOS) // from Redux, true if OS is iOS
  const isAndroid = useSelector(({ user }) => user?.isAndroid) // from Redux, true if OS is Android

  const handleBiometrics = () => {
    if (!passkey) {
      const callback = cId => {
        setTimeout(() => {
          dispatch(toggleBiometrics({ passkey: cId, set: true }))
          // toastShow(6000, 'Biometric Lock Enabled!', 'You will be prompted to use biometrics the next time you start the app.', 'success')
        }, 500)
      }
      signup(cId => callback(cId))
    } else {
      if (window.confirm('Are you sure you want to disable Biometric Lock on this device?')) {
        dispatch(toggleBiometrics({ passkey, set: false }))
        setTimeout(() => toastShow(6000, 'Biometric Lock Disabled!', 'Your app is no longer locked with biometrics.', 'success'), 1000)
      }
    }
  }

  const canUseBiometrics = window.PublicKeyCredential
  const showBiometricTask = canUseBiometrics && connected && (isAndroid || isIOS)

  return (
    <>
      {showBiometricTask &&
        <MenuItem sx={{ mb: 3 }}
                  onClick={() => {
                    handleBiometrics()
                  }}
        >
          <ListItemIcon>
            <FingerprintOutlinedIcon sx={{ color: passkey ? 'green' : 'red' }} />
          </ListItemIcon>
          <ListItemText>{passkey ? 'Disable' : 'Enable'} Biometric Lock</ListItemText>
        </MenuItem>}
      <MenuItem sx={{ mb: 16 }}
                onClick={() => {
                  setOpenSignOutDialog(true)
                }}
      >
        <ListItemIcon>
          <LogoutTwoToneIcon />
        </ListItemIcon>
        <ListItemText>Log Out</ListItemText>
      </MenuItem>
    </>
  )
}
