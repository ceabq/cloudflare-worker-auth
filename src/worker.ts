/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import apiRouter from './router';
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

//https://github.com/cloudflare/kv-asset-handler/issues/360
import manifestJSON from '__STATIC_CONTENT_MANIFEST'
const assetManifest = JSON.parse(manifestJSON)
import { Env } from '../worker-configuration'; 

let kvpageoption:any = {}
kvpageoption.mapRequestToAsset = kvpagepathhandleauth()

function kvpagepathhandleauth() {
	return (request: Request) => {
		let defaultAssetKey = mapRequestToAsset(request)
		let url = new URL(defaultAssetKey.url)
		console.log(url.pathname)
		url.pathname = url.pathname.replace('/api/callback/','/pages/login-callback/')
		console.log(url.pathname) 
		return new Request(url,defaultAssetKey)
	}
}

  // Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);
		// You can get pretty far with simple logic like if/switch-statements
		const auth0callbackurl = env.redirectUri
		kvpageoption.ASSET_NAMESPACE = env.__STATIC_CONTENT
		kvpageoption.ASSET_MANIFEST =  assetManifest
		if (url.pathname.includes('/api/callback')) {
			try {
			return getAssetFromKV({request,waitUntil(promise) { return ctx.waitUntil(promise)}},kvpageoption
				)
		}
			catch(e) {
				console.log(e)
				return new Response('worker throw an error')
			}
		}
		if (url.pathname.startsWith('/api/')) {
			// You can also use more robust routing
			return apiRouter.handle(request, env, ctx);
		}

		return new Response(
			`you shouldn't be on this page`,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	},
};
