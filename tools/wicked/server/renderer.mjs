const renderer = (require) => {
    const linkedom = require('linkedom');
    const fs = require('node:fs');

    const dom = linkedom.parseHTML(index, {
        get history() {
            return {
                get location() { return { pathname: '/' }; }
            };
        },
        get location() { return { pathname: '/' }; }
    });
    self = dom.window;
    globalThis.document = dom.document;
    const scripts = dom.document.getElementsByTagName("script");
    scripts.forEach((script) => eval.bind(dom)(fs.readFileSync('dist/linkedom-angular/browser/' + script.src, 'utf8')));
}

renderer;