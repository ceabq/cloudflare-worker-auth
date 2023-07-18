import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/+esm'
import * as jose from 'https://cdn.jsdelivr.net/npm/jose@4.14.4/+esm'
var fragments = location.hash
let idtoken = fragments.split('=')[1] !== undefined ? fragments.split('=')[1] : 'fail'
//set cookie if there are
if (idtoken != 'fail') {
document.cookie = `jwttoken = ${idtoken}; SameSite=strict; Secure;`}
else {
    idtoken = document.cookie.split(';').find((row => row.startsWith("jwttoken")))?.split("="[1])
}
//let authheaders = {Authorization: `Bearer ${idtoken}`}
let axiosresp
await axios.get('https://dev-21ctnirugksg616k.us.auth0.com/.well-known/jwks.json').then(responsa => {
    axiosresp = (responsa)
});
let authjson = axiosresp.data.keys
let pubjwk = authjson[0]
let pubkey = await jose.importJWK({
    kty: pubjwk.kty,
    e: pubjwk.e,
    n: pubjwk.n
}, 'RS256')
let joseverify
try{
 joseverify = await jose.generalVerify(
    { payload: idtoken.split('.')[1],
     signatures: [{ signature: idtoken.split('.')[2],
      protected: idtoken.split('.')[0] }, ]
    },
       pubkey)
}
catch(e) {
    document.getElementById('auth-status').innerHTML = "the token have fail to verify, please try to login again"
    document.getElementById('auth-status').style.color = 'red'
   document.getElementById('auth-status').style.fontSize = 'xxx-large'
}
let { payload, protectedHeader } = joseverify
let payloaddecoded = new TextDecoder().decode(payload)
let payloaddecodedjson = JSON.parse(payloaddecoded)
if (payloaddecodedjson.sid || payloaddecodedjson.exp <= Date.now()) {
    document.getElementById('auth-status').innerHTML = `you are logged in. You are currenlt login with ${payloaddecodedjson.sub.split('|')[0]}, your user id is ${payloaddecodedjson.sub.split('|')[1]}`
    document.getElementById('auth-status').style.color = 'green'
    document.getElementById('auth-status').style.fontSize = 'large'
}