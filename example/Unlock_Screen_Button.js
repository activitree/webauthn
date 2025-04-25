import { useState, useEffect } from 'react'
import { login } from 'meteor/activitree:accounts-webauthn' //
import Box from '@mui/material/Box' // just a div in MUI
import Button from '@mui/material/Button' // just a button in MUI
import Typography from '@mui/material/Typography' // just a text in MUI
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined' // some icons in MUI
import CropFreeOutlinedIcon from '@mui/icons-material/CropFreeOutlined' // some icons in MUI
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined' // some icons in MUI
// import { toggleBiometrics } from '../redux/actions/handlers/persistent_settings' // A redux function. Also described around line 19 in Biometrics.js
import { useDispatch } from 'react-redux' // dispatch function in Redux

export default function ScreenLock ({ passkey }) {
  const dispatch = useDispatch()
  const [isLocked, setIsLocked] = useState(true)

  useEffect(() => {
    const handleFocus = () => setIsLocked(true)
    window.addEventListener('focus', handleFocus)
    // TODO - use this method to cancel listener: https://www.youtube.com/shorts/Z09xJq5iA0c
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleUnlock = async () => {
    const callback = () => setIsLocked(false)
    const removePasskeyOnFailure = () => dispatch(toggleBiometrics({ passkey: null, set: false })) // If my local token is invalid, remove it from my local store.
    login(callback, removePasskeyOnFailure, passkey)
  }

  if (!isLocked) return null

  return (
    <Box>
      <Box sx={{ textAlign: 'center' }}>
        <LockPersonOutlinedIcon sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant='h4' fontWeight='bold'>Screen Locked</Typography>
        <Typography variant='body1'>Please verify to unlock</Typography>

        <Box sx={{ mt: 4 }}>
          <CropFreeOutlinedIcon fontSize='large' sx={{ mr: 2 }} />
          <FingerprintOutlinedIcon fontSize='large' />
        </Box>

        <Button onClick={handleUnlock} variant='outlined' size='large' color='icon' sx={{ mt: 18, fontSize: '140%', borderRadius: '30px', px: 6 }}>
          Verify
        </Button>
      </Box>
    </Box>
  )
}
