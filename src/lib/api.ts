export async function negotiate(handlers: Record<string, () => Promise<Response>>, accept: string | null) {
	const formats = accept?.split(",").map((s) => {
		const i = s.indexOf(";");
		return ~i ? s.slice(0, i) : s;
	});
	let type = formats?.find((f) => f in handlers);

	if (!formats || (!type && formats?.includes("*/*"))) type = Object.keys(handlers)[0];

	if (type) {
		const res = await handlers[type]();
		res.headers.set("Content-Type", type);
		return res;
	} else {
		return new Response(Object.keys(handlers).join(","), { status: 406 });
	}
}

export function jsonResponse(o: unknown, accept: string | null) {
	return negotiate(
		{
			async "application/json"() {
				return new Response(JSON.stringify(o));
			},
		},
		accept
	);
}
