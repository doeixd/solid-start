import {
  H3Event,
  HTTPEventSymbol,
  appendResponseHeader,
  getRequestIP,
  getResponseHeader,
  getResponseHeaders,
  getResponseStatus,
  getResponseStatusText,
  getWebRequest,
  removeResponseHeader,
  setHeader,
  setResponseHeader,
  setResponseStatus,
} from "vinxi/http";
import type { FetchEvent, ResponseStub } from "./types";

const fetchEventSymbol = Symbol("fetchEvent");

export function createFetchEvent(event: H3Event): FetchEvent {
  return {
    request: getWebRequest(event),
    response: createResponseStub(event),
    clientAddress: getRequestIP(event),
    locals: {},
    nativeEvent: event,
    [HTTPEventSymbol]: event
  };
}

export function cloneEvent<T extends FetchEvent>(fetchEvent: T): T {
  return {
    ...fetchEvent,
    [HTTPEventSymbol]: fetchEvent[HTTPEventSymbol]
  };
}

export function getFetchEvent(h3Event: H3Event): FetchEvent {
  if (!(h3Event as any)[fetchEventSymbol]) {
    const fetchEvent = createFetchEvent(h3Event);
    (h3Event as any)[fetchEventSymbol] = fetchEvent;
  }

  return (h3Event as any)[fetchEventSymbol];
}

export function mergeResponseHeaders(h3Event: H3Event, headers: Headers) {
  for (const [key, value] of headers.entries()) {
    setHeader(h3Event, key, value);
  }
}

class HeaderProxy {
  constructor(private event: H3Event) {}
  get(key: string) {
    const h = getResponseHeader(this.event, key);
    return Array.isArray(h) ? h.join(", ") : h;
  }
  has(key: string) {
    return this.get(key) !== undefined;
  }
  set(key: string, value: string) {
    return setResponseHeader(this.event, key, value);
  }
  delete(key: string) {
    return removeResponseHeader(this.event, key);
  }
  append(key: string, value: string) {
    appendResponseHeader(this.event, key, value);
  }
  getSetCookie() {
    const cookies = getResponseHeader(this.event, "Set-Cookie");
    return Array.isArray(cookies) ? cookies : [cookies];
  }
  forEach(fn: (value: string, key: string, object: Headers) => void) {
    return Object.entries<string | string[]>(getResponseHeaders(this.event)).forEach(([key, value]) => fn(Array.isArray(value) ? value.join(", ") : value, key, this));
  }
  entries() {
    return Object.entries<string | string[]>(getResponseHeaders(this.event)).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(", ") : value
    ] as [string, string])[Symbol.iterator]();
  }
  keys() {
    return Object.keys(getResponseHeaders(this.event))[Symbol.iterator]();
  }
  values() {
    return Object.values<string | string[]>(getResponseHeaders(this.event)).map((value) =>
      Array.isArray(value) ? value.join(", ") : value
    )[Symbol.iterator]();
  }
  [Symbol.iterator]() {
    return this.entries()[Symbol.iterator]();
  }
}

function createResponseStub(event: H3Event): ResponseStub {
  return {
    get status() {
      return getResponseStatus(event);
    },
    set status(v) {
      setResponseStatus(event, v);
    },
    get statusText() {
      return getResponseStatusText(event);
    },
    set statusText(v) {
      setResponseStatus(event, getResponseStatus(), v);
    },
    headers: new HeaderProxy(event)
  };
}
