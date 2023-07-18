import { Router } from 'itty-router';
import auth0 from 'auth0-js';
import { Env } from '../worker-configuration';

let  auth0option = {domain: 'example.us.auth0.com', clientID: 'clientid',redirectUri : 'http://localhost:3000/api/callback' , responseType: 'id_token', nonce:'replace.nouce040411111'}
const auth0main = new auth0.Authentication(auth0option)
let htmlheader = new Headers({"Content-Type": "text/html"})

async function modauthoption(env:Env) {
	auth0option['redirectUri'] = env.redirectUri
	auth0option['clientID'] = env.clientID
	auth0option['domain'] = env.authdomain
}


async function login(env:Env) {
	modauthoption(env)
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
	modauthoption(env)
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
