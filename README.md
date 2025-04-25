# Accounts WebAuthn

A Meteor package that implements WebAuthn (Web Authentication) based on the [@simplewebauthn](https://github.com/MasterKale/SimpleWebAuthn) NPM package. This package allows you to add passkey-based authentication to your Meteor application.

## Overview

This package provides a complete implementation of the WebAuthn standard for Meteor applications, allowing users to register and authenticate using biometric authentication methods (fingerprint, face recognition) or security keys. It leverages the SimpleWebAuthn library to handle the complex WebAuthn protocol.

## Installation

```bash
meteor add activitree:accounts-webauthn
```

## Configuration

### Environment Variables

For production, you'll need to set the following environment variables:

- `MONGO_USERS_USER`: MongoDB username for the accounts database
- `MONGO_USERS_PASS`: MongoDB password for the accounts database
- `MONGO_USERS_DOMAIN`: MongoDB domain for the accounts database

### Relying Party Configuration

You'll need to update the RP_ID and CLIENT_URL in `server/server.js` to match your application's domain:

```javascript
const RP_ID = 'your-domain.com'
const CLIENT_URL = 'https://your-domain.com'
```

## Usage

### Client-Side

#### Registration (Creating a Passkey)

```javascript
import { signup } from 'meteor/activitree:accounts-webauthn';

// Call this function when a user wants to register a new passkey
signup((credentialId) => {
  // This callback is called when registration is successful
  // credentialId is the ID of the newly created passkey
  console.log('Passkey registered with ID:', credentialId);
});
```

#### Authentication (Using a Passkey)

```javascript
import { login } from 'meteor/activitree:accounts-webauthn';

// Call this function when a user wants to authenticate with a passkey
login(
  () => {
    // This callback is called when authentication is successful
    console.log('Authentication successful');
  },
  () => {
    // This function is called if the passkey needs to be removed due to failure
    console.log('Removing passkey due to authentication failure');
  },
  credentialId // The ID of the passkey to authenticate with
);
```

### Server-Side

The package automatically sets up the necessary Meteor methods on the server:

- `initRegister`: Initializes the registration process
- `verifyRegister`: Verifies the registration response
- `initAuth`: Initializes the authentication process
- `verifyAuth`: Verifies the authentication response
- `toggleBiometrics`: Removes a passkey

## Database

The package uses a MongoDB collection named `passkeys` to store WebAuthn credentials. The collection has the following schema:

- `userId`: The Meteor user ID
- `webAuthnUserID`: The WebAuthn user ID created during registration
- `id`: A unique identifier for the credential
- `publicKey`: The public key bytes used for authentication verification
- `counter`: The number of times the authenticator has been used
- `transports`: An array of strings indicating how the browser can communicate with the authenticator
- `deviceType`: Whether the passkey is single-device or multi-device
- `backedUp`: Whether the passkey has been backed up

## Dependencies

- `@simplewebauthn/server`: Server-side WebAuthn implementation
- `@simplewebauthn/browser`: Client-side WebAuthn implementation
- `@activitree/simpl-schema`: Schema validation
- `aldeed:collection2`: Collection schema validation
- `@act/toastr-component`: Toast notifications (client-side)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Developed by [Activitree](https://github.com/activitree).
