# WebAuthn Biometric Authentication Example

This example demonstrates how to implement biometric authentication (fingerprint, face recognition) in a Meteor application using the `activitree:accounts-webauthn` package. The example shows how to:

1. Enable/disable biometric lock for an application
2. Implement a screen lock that requires biometric verification to unlock
3. Manage the authentication state using Redux

## Files in this Example

### 1. Biometrics.js

This file contains a React component that provides UI for enabling or disabling biometric authentication. It includes:

- A toggle menu item that changes color (red to green) when biometric lock is enabled
- Redux actions for managing the biometric authentication state
- Integration with the WebAuthn API through the `signup` function

The component shows a menu item for enabling/disabling biometric lock only on compatible devices (iOS or Android with WebAuthn support).

### 2. Unlock_Screen_Button.js

This file implements a screen lock component that appears when the application comes into focus. It:

- Displays a lock screen with a "Verify" button
- Handles the biometric authentication process using the `login` function
- Automatically locks the screen when the window regains focus
- Removes the lock screen when authentication is successful

### 3. Enable Biometric Lock.jpg

This image shows the UI state changes when biometric lock is enabled. It visually demonstrates how the toggle button changes from red (disabled) to green (enabled) after successful authentication.

## How to Use This Example

### Prerequisites

- A Meteor application with the `activitree:accounts-webauthn` package installed
- React and Redux set up in your application
- Material-UI (MUI) for the UI components

### Implementation Steps

1. **Add the Biometrics Component**:
   - Import and use the `BiometricsAndLogout` component in your settings or profile menu
   - Ensure you have Redux set up with the appropriate state management for the passkey

2. **Add the Screen Lock Component**:
   - Import and use the `ScreenLock` component in your main application layout
   - Pass the passkey from your Redux store to the component

3. **Configure Redux**:
   - Implement the `toggleBiometrics` action to manage the biometric authentication state
   - Store the passkey in your Redux store, preferably with persistence (e.g., using Redux Persist)

### Example Usage

```javascript
// In your settings menu
import BiometricsAndLogout from './Biometrics';

function SettingsMenu() {
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false);
  
  return (
    <Menu>
      <BiometricsAndLogout setOpenSignOutDialog={setOpenSignOutDialog} />
      {/* Other menu items */}
    </Menu>
  );
}

// In your main layout
import ScreenLock from './Unlock_Screen_Button';
import { useSelector } from 'react-redux';

function AppLayout() {
  const passkey = useSelector(({ persist }) => persist?.passkey);
  
  return (
    <>
      {passkey && <ScreenLock passkey={passkey} />}
      {/* Your app content */}
    </>
  );
}
```

## Notes

- The biometric lock will only be offered on compatible devices (iOS or Android with WebAuthn support)
- When enabled, users will be prompted for biometric verification whenever the app comes into focus
- The passkey is stored locally in Redux and persisted in IndexedDB
- If authentication fails, the passkey can be automatically removed from local storage
