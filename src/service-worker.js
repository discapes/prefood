// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { build, files, prerendered, version } from '$service-worker';

const prefillRuntime = ['/todos', '/todos/__data.json'];

const ICACHE = `immutable`;
const VCACHE = `versioned-${version}`;

self.addEventListener('install', (e) =>
	/*e.waitUntil*/ Promise.all([
		caches.keys().then((cacheList) =>
			Promise.all(
				cacheList
					.filter((c) => c.startsWith('versioned') && !c.endsWith(version))
					.map((oldCache) => {
						console.log(`deleting old cache ${oldCache}`);
						return caches.delete(oldCache);
					})
			)
		),

		caches.open(VCACHE).then((vCache) => {
			console.log(`adding ${prerendered.concat(files)} to ${VCACHE}`);
			return vCache.addAll(prerendered.concat(files));
		}),

		caches.open(ICACHE).then((iCache) =>
			Promise.all([
				iCache.addAll(build),
				iCache.keys().then((keys) =>
					Promise.all(
						keys
							.map((k) => new URL(k.url).pathname)
							.filter((url) => !build.includes(url))
							.map((oldURL) => {
								console.log(`deleting ${oldURL} from ${ICACHE}`);
								return iCache.delete(oldURL);
							})
					)
				)
			])
		),

		caches.open(`runtime`).then((rtCache) => {
			console.log(`adding ${prefillRuntime} to runtime cache`);
			return rtCache.addAll(prefillRuntime);
		}),

		self.skipWaiting(),

		(async () => {
			console.log(`sw installing`);
		})()
	])
);

function matchCaches(cacheNames, url) {
	return Promise.any(
		cacheNames.map((c) => resolveIfTruthy(caches.open(c).then((cache) => cache.match(url))))
	);
}

function resolveIfTruthy(promise) {
	return new Promise((resolve) => {
		promise.then((result) => result && resolve(result));
	});
}

self.addEventListener('fetch', (e) =>
	e.respondWith(
		(async () => {
			const url = e.request.url;
			const match = await matchCaches([ICACHE, VCACHE], url);
			if (match) {
				console.log(`hit for ${new URL(url).pathname}`);
				return match;
			} else {
				console.log(`miss for ${new URL(url).pathname}`);
				const res = await fetch(url, { mode: 'no-cors' });
				if (!res.ok) {
					const rt = await caches.open(`runtime`);
					const match = rt.match(url);
					if (match) return match;
				}
				caches.open(`runtime`).then((rtCache) => rtCache.put(url, res));
				return res.clone();
			}
		})()
	)
);
