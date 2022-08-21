const fs = require('node:fs');
const vm = require('node:vm');

const renderer = fs.readFileSync('tools/wicked/server/renderer.mjs');

const runInSpecializedContext = (oldGlobalThis, context, code) => {
    globalThis = vm.createContext(context);
    vm.runInContext(code, context)(require);
    globalThis = oldGlobalThis;
    return context;
}

class Engine {
    async render(document) {
        let context = { index: document, console, setTimeout };

        const resultingContext = runInSpecializedContext(globalThis, context, renderer);
        await new Promise(r => setTimeout(r, 0));

        return resultingContext.self.document.toString()
    }
}

module.exports = { Engine }