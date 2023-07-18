# WARNING: The code might be unstable and insecure

This project uses auth0 and cloudflare worker to authorize user. 

How to use:

1. Change Line 13 in public_files/pages/login-callback/js/token.js to your own domain.

2. add 

   ```toml
   [vars]
   redirectUri = 'Your deploy domain/api/callback'
   clientID = 'your auth0 clientID'
   authdomain = 'auth0 domain
   ```

   