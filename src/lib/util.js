export function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

const overrideImages = 'nature';

export async function getImages(text, n) {
	const params = new URLSearchParams({
		method: 'flickr.photos.search',
		api_key: '6576bae092a7939b9853c20551d15e88',
		per_page: n,
		format: 'json',
		nojsoncallback: '1',
		text: overrideImages ?? text
	});
	const url = new URL('https://www.flickr.com/services/rest/?' + params);
	const json = await fetch(url).then((res) => res.json());
	const photos = json.photos.photo.map(
		(p) => `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}.jpg`
	);
	return photos;
}

export async function getRandomImage(text, n = 99) {
	const params = new URLSearchParams({
		method: 'flickr.photos.search',
		api_key: '6576bae092a7939b9853c20551d15e88',
		per_page: n.toString(),
		format: 'json',
		nojsoncallback: '1',
		text: overrideImages ?? text
	});
	const url = new URL('https://www.flickr.com/services/rest/?' + params);
	const json = await fetch(url).then((res) => res.json());
	const p = randomElem(json.photos.photo);
	return `https://live.staticflickr.com/${p.server}/${p.id}_${p.secret}.jpg`;
}

export function randomElem(array) {
	return array[Math.floor(Math.random() * array.length)];
}
