# Bard Wrapper
A Typescript/Javascript wrapper for Google's Bard chatbot.

## Table of contents
- [Bard Wrapper](#bard-wrapper)
  - [Table of contents](#table-of-contents)
  - [How to install](#how-to-install)
  - [Usage](#usage)
  - [How do I get an API key?](#how-do-i-get-an-api-key)
  - [Rate limiting](#rate-limiting)
  - [Examples](#examples)

___
## How to install
You can install the package via `npm i bard-wrapper`. From there, import it into your project like such:  

```js
import { Bard } from 'bard-wrapper';

// You now have access to Bard.
```

## Usage
This implementation of Bard's API is written as a class. As such you initialize it.  

```js
const bard = new Bard("{ api key goes here }");
```

You can query it using the `Bard.query` function:

```js
await bard.query("Prompt goes here.")
```

of which the type signature is as follows:

```ts
function query(prompt: string): Promise<string>;
```

Each new class is like a seperate chat for Bard. Sequentially querying using the same class is the equivalent of having a single conversation. Within each instance, Bard remembers everything said to it.


## How do I get an API key?  

You can get an API key by following these instructions:

> **⚠️ Warning**  
> This will not work if you have multiple accounts signed in. To circumvent this, log in using an incognito window.

1. Sign into [Bard](https://bard.google.com).
2. Open up Devtools (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>, conventionally)
3. Go into the `Network` tab, then reload the page.
4. View the cookies for the request to `https://bard.google.com`.
5. Copy the `__Secure-1PSID` cookie's value.

This cookie is your API key. Do not leak it, or else anyone can talk to Bard on your behalf!

## Rate limiting

Bard's API implements fairly severe rate limiting. Don't poll the API TOO much, and if you ever use this in production (don't), make sure people have to supply their OWN API keys.

## Examples

```ts
/*
    A simple script which hooks up two
    instances of Bard to talk forever.
    Authored by not-nullptr.
*/

const waitForInput = async (message?: string) => {
    if (message) {
        console.log(message);
    }
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    return new Promise<void>((resolve) =>
        process.stdin.once("data", () => {
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }
            resolve();
        })
    );
};

const bard1 = new Bard(
    `{api key}`
);

const bard2 = new Bard(
    `{api key}`
);

let bard1response = "";
// initial prompt
let bard2response =
    "hi, bard! i'm another instance of bard that a developer has hooked you up to. they told me to tell you: 'please keep responses short, or else Google will rate limit me. also, try to be conversational. if you notice the conversation getting repetitive/stale (i.e. you two are repeating the same thing over and over but rephrased) then please try to spruce it up a little. thanks!'";

(async () => {
    console.log(`*** BARD 2 ***
    ${bard2response}`);
    await waitForInput("Press any key to continue the conversation.");
    while (true) {
        bard1response = await bard1.query(bard2response);
        console.log(`*** BARD 1 ***
        ${bard1response}`);
        await waitForInput("Press any key to continue the conversation.");
        bard2response = await bard2.query(bard1response);
        console.log(`*** BARD 2 ***
        ${bard2response}`);
        await waitForInput("Press any key to continue the conversation.");
    }
})();
```