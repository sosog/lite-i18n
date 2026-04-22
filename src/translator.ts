import { Translations, Variables, TranslatorOptions, PluralOptions } from './types';

export class Translator {
    private locale: string;
    private translations: Record<string, Translations>;
    private fallbackLocale?: string;

    constructor(options: TranslatorOptions) {
        this.locale = options.locale;
        this.translations = options.translations;
        this.fallbackLocale = options.fallbackLocale;
    }

    public t(key: string, variables?: Variables): string {
        let lookupKey = key;

        // Simple pluralization: if count is provided and not 1, look for _plural key
        if (variables && typeof variables.count === 'number' && variables.count !== 1) {
            const pluralKey = `${key}_plural`;
            if (this.getTranslation(this.locale, pluralKey) || (this.fallbackLocale && this.getTranslation(this.fallbackLocale, pluralKey))) {
                lookupKey = pluralKey;
            }
        }

        let template = this.getTranslation(this.locale, lookupKey);

        if (!template && this.fallbackLocale) {
            template = this.getTranslation(this.fallbackLocale, lookupKey);
        }

        if (!template) {
            // Fallback to original key if translation missing
            return key;
        }

        return this.interpolate(template, variables);
    }

    public plural(count: number, options: Omit<PluralOptions, 'count'>): string {
        const vars: Variables = { count, ...options };
        let template = options.other;

        if (count === 0 && options.zero) {
            template = options.zero;
        } else if (count === 1) {
            template = options.one;
        }

        return this.interpolate(template, vars);
    }

    public setLocale(locale: string): void {
        this.locale = locale;
    }

    public getLocale(): string {
        return this.locale;
    }

    /** Resolves a key to its translation string using current locale + fallback, or returns the key itself. */
    private resolveKey(key: string): string {
        return this.getTranslation(this.locale, key)
            ?? (this.fallbackLocale ? this.getTranslation(this.fallbackLocale, key) : null)
            ?? key;
    }

    private getTranslation(locale: string, key: string): string | null {
        const keys = key.split('.');
        let current: any = this.translations[locale];

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return null;
            }
        }

        return typeof current === 'string' ? current : null;
    }

    private interpolate(template: string, variables?: Variables, escapeValues = false): string {
        if (!variables) {
            return template;
        }

        return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
            const value = variables[key];
            if (value === undefined || value === null) {
                return `{{${key}}}`;
            }
            const str = String(value);
            return escapeValues ? this.escapeHtml(str) : str;
        });
    }

    /**
     * Escapes HTML special characters in a string to prevent XSS.
     * Only applied to interpolated variable values, never to the translation string itself.
     */
    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Safely sets rich-text translation content without using innerHTML on the live DOM.
     *
     * Strategy:
     *   1. Variable values are HTML-escaped before interpolation (prevents injection via user data).
     *   2. The resulting string is parsed with DOMParser in an isolated, inert document
     *      (scripts in that document never execute).
     *   3. We walk the parsed tree and copy only text nodes and whitelisted elements to
     *      the target element — event attributes and unknown tags are silently dropped.
     *
     * Allowed tags: b, i, em, strong, u, s, br, span, abbr, mark, small, sub, sup, a
     * Allowed attributes on <a>: href (javascript: URLs are blocked)
     */
    private setSafeHtml(target: HTMLElement, html: string): void {
        const ALLOWED_TAGS = new Set([
            'b', 'i', 'em', 'strong', 'u', 's', 'br',
            'span', 'abbr', 'mark', 'small', 'sub', 'sup', 'a',
        ]);

        // Clear the element without innerHTML
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }

        // Parse in an isolated document — scripts cannot execute here
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<!DOCTYPE html><body>${html}</body>`, 'text/html');

        const transfer = (source: Node, dest: Node): void => {
            source.childNodes.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    dest.appendChild(document.createTextNode(child.textContent ?? ''));
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    const el = child as Element;
                    const tag = el.tagName.toLowerCase();

                    if (ALLOWED_TAGS.has(tag)) {
                        const newEl = document.createElement(tag);

                        // Allowlist attributes per-tag
                        if (tag === 'a') {
                            const href = el.getAttribute('href');
                            if (href && !/^javascript:/i.test(href.trim())) {
                                newEl.setAttribute('href', href);
                            }
                            // Copy rel/target if present
                            ['rel', 'target'].forEach((attr) => {
                                const val = el.getAttribute(attr);
                                if (val) newEl.setAttribute(attr, val);
                            });
                        }

                        dest.appendChild(newEl);
                        transfer(child, newEl); // recurse into children
                    } else {
                        // Unknown tag: still transfer its text children
                        transfer(child, dest);
                    }
                }
                // All other node types (comments, scripts, etc.) are dropped
            });
        };

        transfer(doc.body, target);
    }

    /**
     * Auto-translate all elements with data-i18n attribute
     */
    public autoTranslate(): void {
        if (typeof document === 'undefined') return;

        // Handle standard text translations (safe)
        document.querySelectorAll('[data-i18n]').forEach((el: Element) => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;

            const varsAttr = el.getAttribute('data-i18n-vars');
            const variables = varsAttr ? JSON.parse(varsAttr) : undefined;

            (el as HTMLElement).textContent = this.t(key, variables);
        });

        // Handle rich-text translations safely — no innerHTML on the live DOM.
        // Variable values are HTML-escaped before parsing; only whitelisted tags survive.
        document.querySelectorAll('[data-i18n-html]').forEach((el: Element) => {
            const key = el.getAttribute('data-i18n-html');
            if (!key) return;

            const varsAttr = el.getAttribute('data-i18n-vars');
            const variables = varsAttr ? JSON.parse(varsAttr) : undefined;

            // Escape variable values BEFORE interpolation so user data cannot inject tags
            const html = this.interpolate(this.resolveKey(key), variables, true);
            this.setSafeHtml(el as HTMLElement, html);
        });
    }
}
