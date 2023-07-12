import { Router } from 'itty-router';
import auth0 from 'auth0-js';
import { Env } from '../worker-configuration';

let  auth0option = {domain: 'dev-21ctnirugksg616k.us.auth0.com', clientID: 't4nCjwtSWGdKylmAvxsTfQZiGsf0RNdh',redirectUri : 'http://localhost:3000/api/callback' , responseType: 'id_token', nonce:'replace.nouce040411111'}
const auth0main = new auth0.Authentication(auth0option)
let htmlheader = new Headers({"Content-Type": "text/html"})
async function login(env:Env) {
	auth0option['redirectUri'] = env.redirectUri
	await auth0noucegen()
	return Response.redirect(auth0main.buildAuthorizeUrl(auth0option))
};
async function randbuf() {
	//maybe- unsafe?
	let cryptodigest = await crypto.subtle.digest('SHA-512', crypto.getRandomValues(new Uint32Array(20)))
	//copied from cloudflare
	let hexString = [...new Uint8Array(cryptodigest)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
	//
	return hexString
	
}
async function logout(env:Env) {
	auth0option['redirectUri'] = env.redirectUri
	return Response.redirect(auth0main.buildLogoutUrl(auth0option))
}
async function auth0noucegen() {
	auth0option.nonce = await randbuf()
	//upload nouce to db, expire after 10 hr
}

// now let's create a router (note the lack of "new")
const router = Router();
router.get('/api/login', (_,env)=> login(env))
router.get('/api/logout', (_,env) => logout(env))
router.get('/api/rand/digest',async () => {return new Response(await randbuf())});
router.get('/pages/logout', ()=> {return new Response('you have been logout',{headers:htmlheader})})


// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
