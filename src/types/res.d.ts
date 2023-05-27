type StreamResponse = [
	[string, string | null, string],
	[string, number],
	[string, number, string, number]
];

type BardResponse = [
	[string],
	[string, string],
	[[string, number], [string, number]],
	[],
	[string, [string], [], null, null, null, boolean][]
];
