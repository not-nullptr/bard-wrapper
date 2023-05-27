/**
 * @description A class representing a Bard conversation.
 */
class Bard {
	private _auth: string;
	private _locale?: string;
	private _c: string | null = "";
	private _r: string | null = "";
	private _rc: string | null = "";
	private _dementiaMode = false;
	/**
	 * @description Gets the SnlM0e (required secondary auth token?) from Bard's website, using the auth token defined in the constructor.
	 * @returns The SnlM0e
	 * @todo This function is potentially unreliable/unstable in unsupported countries and with multiple logged in accounts.
	 */
	private getSNlM0e = async () => {
		const req = await fetch("https://bard.google.com", {
			headers: {
				Cookie: `__Secure-1PSID=${this._auth}`,
			},
			cache: "no-store",
		});
		const text = await req.text();
		const snlm0e = text.match(/"SNlM0e":"(.*?)"/); // WILDLY inefficient
		if (!snlm0e || !snlm0e[1])
			throw new BardError(
				"SnlM0e not found (is your auth token correct?)"
			);
		return snlm0e[1];
	};
	/**
	 * @description Constructs the `Bard` class.
	 * @param {string} auth The authentication token
	 * @param {string} [locale] The locale which Bard should talk in.
	 */
	constructor(auth: string, locale?: string) {
		this._auth = auth;
		this._locale = locale;
	}
	/**
	 * @description Sets the memory mode (whether or not the Bard instance forgets everything after each prompt). Useful for single-prompt use cases where you don't want to keep initializing new classes.
	 * @param {boolean} mem The memory mode to set.
	 */
	setMemory = (mem: boolean) => {
		this._dementiaMode = mem;
	};
	/**
	 * @description Queries the Bard instance.
	 * @param {string} prompt The query of which to ask Bard.
	 * @returns {Promise<string>} A promise which will resolve to Bard's response.
	 */
	query = async (prompt: string): Promise<string> => {
		const req = await fetch(
			"https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate",
			{
				method: "POST",
				headers: {
					"Content-Type":
						"application/x-www-form-urlencoded;charset=utf-8",
					Cookie: `__Secure-1PSID=${
						this._auth || process.env.BARD_TOKEN
					}`,
				},
				cache: "no-store",
				body: new URLSearchParams({
					"f.req": JSON.stringify([
						null,
						JSON.stringify([
							[prompt, null, null, []],
							[this._locale || "en-GB"],
							[this._c, this._r, this._rc],
						]),
					]),
					at: await this.getSNlM0e(),
				}),
			}
		);
		const res = await req.text();
		const body = JSON.parse(
			res.split("\n").slice(1).join("\n")
		) as StreamResponse;
		try {
			const bardResponse = JSON.parse(body[0][2]) as BardResponse;
			if (!this._dementiaMode) {
				this._c = bardResponse[1][0];
				this._r = bardResponse[1][1];
				this._rc = bardResponse[4][0][0];
			} else {
				this._c = "";
				this._r = "";
				this._rc = "";
			}
			return bardResponse[0][0];
		} catch (e) {
			if (this._dementiaMode)
				throw new BardError(
					"Your account has been severely rate-limited or banned."
				);
			console.error(
				"An error has been detected relating to your account either being rate-limited or banned from Bard. Single prompt mode has been activated, which will forcibly disable Bard's memory, which can bypass this some of the time."
			);
			this._dementiaMode = true;
			return await this.query(prompt);
		}
	};
}

module.exports = { Bard };
