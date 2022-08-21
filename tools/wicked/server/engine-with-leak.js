const fs = require('node:fs');
const vm = require('node:vm');
const linkedom = require('linkedom');

/**
 * This engine exhibits a memory leak when using the out-of-the-box `runtime.js`
 * that comes with Angular 13. 
 * 
 * Specifically, the lines:
 * 
 * ```bash
 * var chunkLoadingGlobal = self["webpackChunklinkedom_angular"] = self["webpackChunklinkedom_angular"] || [];
 * chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
 * chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
 * ```
 * 
 * Cause a nested `bind` on top of the push function of this array, 
 * which is pretty nasty as a result of the fact that self isn't updated on a new render 
 * (like in the browser).
 */
class Engine {
    async render(document) {
        
        const dom = linkedom.parseHTML(document, {
            get history() {
                return {
                    get location() { return { pathname: '/' }; }
                };
            },
            get location() { return { pathname: '/' }; }
        });
        const context = dom;
        dom.self = {};
        vm.createContext(context);
        const scripts = dom.document.getElementsByTagName("script");
        scripts.forEach((script) => {
            vm.runInContext(fs.readFileSync('dist/linkedom-angular/browser/' + script.src, 'utf8'), context);
        });

        await new Promise(r => setTimeout(r, 0));

        return dom.document.toString()
    }
}

module.exports = { Engine }