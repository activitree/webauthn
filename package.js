Package.describe({
  name: 'activitree:accounts-webauthn',
  summary: 'Accounts system plugin for WebAuthn',
  version: '0.0.1'
})

Npm.depends({
  '@simplewebauthn/server': '13.1.1',
  '@simplewebauthn/browser': '13.1.0'
})

Package.onUse(api => {
  api.use(['ecmascript'], ['client', 'server'])
  api.use(['mongo', 'aldeed:collection2'], 'server')

  api.mainModule('server/server.js', 'server')
  api.mainModule('client.js', 'client')
})
