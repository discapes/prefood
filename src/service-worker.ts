import { build, files, prerendered, version } from '$service-worker';

const IMMUTABLE_CACHE = `immutable`;
const PRERENDER_CACHE_PREFIX = `prerendered`;
const PRERENDER_CACHE = `${PRERENDER_CACHE_PREFIX}-${version}`;
const RUNTIME_CACHE = `runtime`;

self.addEventListener('install', () =>
	/*e.waitUntil*/ Promise.all([
		caches.keys().then((cacheList) =>
			Promise.all(
				cacheList
					.filter((c) => c.startsWith(PRERENDER_CACHE_PREFIX) && !c.endsWith(version))
					.map((oldCache) => {
						console.log(`deleting old cache ${oldCache}`);
						return caches.delete(oldCache);
					})
			)
		),

		caches.open(PRERENDER_CACHE).then((vCache) => {
			console.log(`adding ${prerendered.concat(files)} to ${PRERENDER_CACHE}`);
			return vCache.addAll(prerendered.concat(files));
		}),

		caches.open(IMMUTABLE_CACHE).then((iCache) =>
			Promise.all([
				iCache.addAll(build),
				iCache.keys().then((keys) =>
					Promise.all(
						keys
							.map((k) => new URL(k.url).pathname)
							.filter((url) => !build.includes(url))
							.map((oldURL) => {
								console.log(`deleting ${oldURL} from ${IMMUTABLE_CACHE}`);
								return iCache.delete(oldURL);
							})
					)
				)
			])
		),

		self.skipWaiting(),

		(async () => {
			console.log(`sw installing`);
		})()
	])
);

function matchCaches(cacheNames: string[], url: string) {
	return Promise.any(cacheNames.map((c) => resolveIfTruthy(caches.open(c).then((cache) => cache.match(url)))));
}

function resolveIfTruthy<T>(promise: Promise<T>): Promise<T> {
	return new Promise((resolve) => {
		promise.then((result) => result && resolve(result));
	});
}

// self.addEventListener('fetch', (e: FetchEvent) =>
// 	e.respondWith(
// 		(async () => {
// 			const url = e.request.url;
// 			const match = await matchCaches([IMMUTABLE_CACHE, PRERENDER_CACHE], url);
// 			if (match) {
// 				console.log(`hit for ${new URL(url).pathname}`);
// 				return match;
// 			}
// 			console.log(`miss for ${new URL(url).pathname}`);
// 			const res = await fetch(url /*{ mode: 'no-cors' }*/);
// 			if (!res.ok) {
// 				const rt = await caches.open(RUNTIME_CACHE);
// 				const match = await rt.match(url);
// 				if (match) return match;
// 				else throw new Error(`Couldn't fetch ${url}`);
// 			}
// 			caches.open(RUNTIME_CACHE).then((rtCache) => rtCache.put(url, res));
// 			return res.clone();
// 		})()
// 	)
// );
