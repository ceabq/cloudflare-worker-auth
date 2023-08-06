import { IRequest, Router } from 'itty-router';
import auth0, { Authentication } from 'auth0-js';
import { Env } from '../worker-configuration';


let htmlheader = new Headers({"Content-Type": "text/html"})

function modauthoption(env:Env,request:IRequest) {
	let auth0option = {domain: 'example.us.auth0.com', clientID: 'clientid',redirectUri : 'http://localhost:3000/api/callback' , responseType: 'id_token', nonce:'replace.nouce040411111'}
	auth0option['redirectUri'] = env.redirectUri
	auth0option['clientID'] = env.clientID
	auth0option['domain'] = env.authdomain
	let auth0main = new auth0.Authentication(auth0option)
	request.auth0main = auth0main
	request.auth0option = auth0option
}


async function login(request:IRequest) {
	let auth0main = request.auth0main
	let auth0option = request.auth0option 
	let auth0optionmod = await auth0noucegen(auth0option) 
	return Response.redirect(auth0main.buildAuthorizeUrl(auth0optionmod))
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
async function logout(request:IRequest) {
	let auth0main = request.auth0main
	let auth0option = request.auth0option 
	return Response.redirect(auth0main.buildLogoutUrl(auth0option))
}
async function auth0noucegen(auth0option:any) {
	auth0option['nonce'] = await randbuf()
	return auth0option
	//upload nouce to db, expire after 10 hr
}

// now let's create a router (note the lack of "new")
const router = Router();
// request,env, ctx
router.get('/api/login', (request, env,_) => {
	modauthoption(env,request)
},(request)=> login(request))

router.get('/api/logout', (request, env,_) => {
	modauthoption(env,request)
}, (request,env) => logout(request))

router.get('/api/rand/digest', async () => {return new Response(await randbuf())});
router.get('/pages/logout', ()=> {return new Response('you have been logout',{headers:htmlheader})})


// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
