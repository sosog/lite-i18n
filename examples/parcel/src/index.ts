import { createTranslator } from 'lite-i18n';
import { en } from './translations/en';
import { es } from './translations/es';

const t = createTranslator('en', { en, es });

// Switch language on button click
document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const locale = target.getAttribute('data-locale');

    if (locale) {
        t.setLocale(locale);
        t.autoTranslate();

        // Update active class
        document.querySelectorAll('[data-locale]').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
    }
});

// Initial render
t.autoTranslate();

// Programmatic / Inline Pluralization Example
const programmaticExample = document.createElement('div');
programmaticExample.style.marginTop = '2rem';
programmaticExample.style.padding = '1rem';
programmaticExample.style.borderTop = '1px solid #eee';

const count = 2;
const pluralText = t.plural(count, {
    one: 'Programmatic: You have one notification',
    other: 'Programmatic: You have {{count}} notifications',
    zero: 'Programmatic: No notifications'
});

programmaticExample.innerHTML = `<p>${pluralText}</p>`;
document.querySelector('.container')?.appendChild(programmaticExample);
