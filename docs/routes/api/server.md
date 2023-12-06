---
section: api
title: use server
order: 100
subsection: Server
active: true
---

# "use server"

Perform actions on the server environment only (i.e. console logging, etc.).

<div class="text-lg">

```tsx twoslash
// ---cut---
const logHello = async (message: string) => {
  "use server";
  console.log(message);
};
```

</div>

<table-of-contents></table-of-contents>

## Usage

### Basic usage

To create a function that only runs on the server, pass a function as a parameter to `server$`.

```tsx twoslash {4-6}
const logHello = async (message: string) => {
  "use server";
  console.log(message);
};

logHello("Hello");
```

In this example, regardless of whether we are rendering this on the server or in the browser, the `logHello` function generates a log on the server console only. How does it work? We use compilation to transform the `use server` function into an RPC call to the server.
