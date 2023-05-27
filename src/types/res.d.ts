type StreamResponse = [
	[string, string | null, string],
	[string, number],
	[string, number, string, number]
];

class BardError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BardError";
	}
}

type BardResponse = [
	[string],
	[string, string],
	[[string, number], [string, number]],
	[],
	[string, [string], [], null, null, null, boolean][]
];
