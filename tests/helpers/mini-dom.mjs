/**
 * Minimal DOM/window stub for driving app.js flows headlessly in Node.
 * Implements exactly the surface the controller touches — nothing more.
 * Not a browser; real DOM semantics are verified separately by serving
 * the site (see verification commands in the README).
 */

export class El {
    constructor(tag = 'div') {
        this.tagName = tag.toUpperCase();
        this.id = '';
        this.children = [];
        this.dataset = {};
        this.style = {};
        this.textContent = '';
        this.attributes = {};
        this.classSet = new Set();
        this.disabled = false;
        this.value = '';
        this.placeholder = '';
        this.href = '';
        this._innerHTML = '';
    }
    get classList() {
        const s = this.classSet;
        return {
            add: (...c) => c.forEach(x => s.add(x)),
            remove: (...c) => c.forEach(x => s.delete(x)),
            toggle: (c, force) => {
                const want = force === undefined ? !s.has(c) : Boolean(force);
                if (want) s.add(c); else s.delete(c);
                return want;
            },
            contains: (c) => s.has(c)
        };
    }
    get className() { return [...this.classSet].join(' '); }
    set className(v) { this.classSet = new Set(String(v).split(/\s+/).filter(Boolean)); }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; }
    removeAttribute(k) { delete this.attributes[k]; }
    hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    addEventListener() { /* listeners not exercised under the stub */ }
    removeEventListener() { }
    appendChild(c) { this.children.push(c); return c; }
    prepend(c) { this.children.unshift(c); return c; }
    insertAdjacentElement(_pos, el) { this.children.push(el); return el; }
    remove() { }
    focus() { }
    click() { }
    select() { }
    closest() { return null; }
    set innerHTML(v) { this._innerHTML = String(v); this.children = []; }
    get innerHTML() { return this._innerHTML; }
}

export function installDOM() {
    const ids = new Map();
    const byId = (id) => {
        if (!ids.has(id)) { const el = new El(); el.id = id; ids.set(id, el); }
        return ids.get(id);
    };
    const selectors = new Map();      // test-registered selector -> El | [El]
    const listeners = new Map();

    global.window = {
        __YASLOGIST_NO_AUTOBOOT__: true,
        location: { href: 'http://localhost/', origin: 'http://localhost', pathname: '/', hash: '' },
        matchMedia: () => ({ matches: true, addEventListener() { } }),
        addEventListener(type, fn) { const l = listeners.get(type) || []; l.push(fn); listeners.set(type, l); },
        localStorage: (() => { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; })(),
        innerWidth: 1280,
        innerHeight: 800,
        devicePixelRatio: 1,
        yaslogistCommands: undefined
    };
    global.document = {
        getElementById: byId,
        querySelector: (sel) => (selectors.get(sel) && !Array.isArray(selectors.get(sel)) ? selectors.get(sel) : null),
        querySelectorAll: (sel) => {
            const v = selectors.get(sel);
            return Array.isArray(v) ? v : v ? [v] : [];
        },
        addEventListener() { },
        createElement: (t) => new El(t),
        createTextNode: (t) => ({ nodeType: 3, nodeValue: String(t) }),
        body: new El('body'),
        documentElement: new El('html'),
        hidden: false,
        title: '',
        fullscreenElement: null
    };
    // Node >= 21 exposes a read-only `navigator` global — define, don't assign.
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true, writable: true });
    global.history = { replaceState() { } };
    global.requestAnimationFrame = () => 0;
    global.cancelAnimationFrame = () => { };
    global.IntersectionObserver = class { observe() { } unobserve() { } disconnect() { } };

    return {
        byId,
        selectors,
        reset() { ids.clear(); selectors.clear(); }
    };
}
