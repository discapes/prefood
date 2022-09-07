export function negotiate(handlers: Record<string, () => Response>, accept: string | null, fallback: string) {
	const formats = accept?.split(",");
	let type = formats?.find((f) => f in handlers);

	if (!formats || (!type && formats?.includes("*/*"))) type = fallback;

	if (type) {
		const res = handlers[type]();
		res.headers.append("Content-Type", type);
		return res;
	} else {
		return new Response(Object.keys(handlers).join(","), { status: 406 });
	}
}
