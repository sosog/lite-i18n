# lite-i18n

A lightweight, type-safe string translation library for TypeScript/JavaScript.

## Features

- 📦 **Universal**: Works with Parcel, Vite, Webpack, Rollup, esbuild
- 🚀 **Lightweight**: Zero dependencies, tiny bundle size
- 🔒 **Type-Safe**: Full TypeScript support
- 🧩 **Simple API**: Dot notation for nested keys, interpolation support
- 🔢 **Pluralization**: Supports both key-based (`_plural` suffix) and inline pluralization
- 🎨 **Rich Text**: Support for HTML/Rich Text interpolation

## Installation

```bash
npm install lite-i18n
```

## Usage

### Basic Usage

```typescript
import { createTranslator } from 'lite-i18n';

const translations = {
  en: {
    greeting: 'Hello, {{name}}!',
    messages: {
      unread: 'You have {{count}} unread messages'
    }
  },
  es: {
    greeting: '¡Hola, {{name}}!',
    messages: {
      unread: 'Tienes {{count}} mensajes no leídos'
    }
  }
};

const t = createTranslator('en', translations);

console.log(t('greeting', { name: 'Alice' })); // "Hello, Alice!"
console.log(t('messages.unread', { count: 5 })); // "You have 5 unread messages"

t.setLocale('es');
console.log(t('greeting', { name: 'Bob' })); // "¡Hola, Bob!"
```

### Pluralization

#### Key-based Pluralization
Automatically detects if a `count` variable is passed and looks for a `_plural` key.

```typescript
const translations = {
  en: {
    items: {
      cart: 'One item in cart',
      cart_plural: '{{count}} items in cart'
    }
  }
};

const t = createTranslator('en', translations);

t.t('items.cart', { count: 1 }); // "One item in cart"
t.t('items.cart', { count: 5 }); // "5 items in cart"
```

#### Inline Pluralization
Define plural forms directly in your code (useful for view-specific logic).

```typescript
const clicks = 2;
const text = t.plural(clicks, {
  one: 'You clicked once',
  other: 'You clicked {{count}} times',
  zero: 'No clicks yet' // Optional zero state
});
// "You clicked 2 times"
```

### HTML / Rich Text
You can pass HTML strings as variables to inject rich text.

```typescript
const translations = {
  en: {
    welcome: 'Welcome, <b>{{name}}</b>!'
  }
};
// ...
const html = t.t('welcome', { name: '<span class="user">Admin</span>' });
// "Welcome, <b><span class="user">Admin</span></b>!"
```

### Declarative Translation
You can automatically translate elements using `data-i18n` attributes.

```html
<h1 data-i18n="global.title"></h1>
<p data-i18n="messages.unread" data-i18n-vars='{"count": 5}'></p>

<!-- For Safe Rich-Text content (whitelisted tags only) -->
<div data-i18n-html="html.welcome"></div>
```

```typescript
t.autoTranslate();
```

This method scans for `data-i18n` (sets `textContent`) and `data-i18n-html` (uses a secure parsing strategy that whitelists safe tags like `<b>`, `<i>`, `<a>`, etc.), parsing optional `data-i18n-vars` (JSON).

## Full Integration Example

Here is a complete setup showing how to initialize the library, handle multiple languages, and use declarative translations in the DOM.

### 1. Define your translations

```typescript
const translations = {
  en: {
    app: {
      title: 'Welcome to Lite-I18n',
      description: 'Your <b>internationalization</b> journey starts here.',
      items: 'You have {{count}} item',
      items_plural: 'You have {{count}} items'
    }
  },
  fr: {
    app: {
      title: 'Bienvenue sur Lite-I18n',
      description: 'Votre voyage d\'<b>internationalisation</b> commence ici.',
      items: 'Vous avez {{count}} article',
      items_plural: 'Vous avez {{count}} articles'
    }
  }
};
```

### 2. Initialize and Translate

```typescript
import { createTranslator } from 'lite-i18n';

// Initialize with English as default
const t = createTranslator('en', translations);

// Manual translation
console.log(t('app.title')); // "Welcome to Lite-I18n"

// Automated DOM translation
t.autoTranslate();

// Switch language later
function updateAppLanguage(lang) {
  t.setLocale(lang);
  t.autoTranslate(); // Re-run to update all data-i18n elements
}
```

### 3. HTML Structure

```html
<!-- Text content -->
<h1 data-i18n="app.title"></h1>

<!-- Safe Rich-Text (whitelisted tags like <b>, <i>, <a> are allowed) -->
<p data-i18n-html="app.description"></p>

<!-- Pluralization with variables -->
<span data-i18n="app.items" data-i18n-vars='{"count": 3}'></span>
```

