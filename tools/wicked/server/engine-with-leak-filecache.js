const fs = require('node:fs');
const vm = require('node:vm');
const linkedom = require('linkedom');

class FileCache {
    constructor(){
        this.cache = new Map();
    }

    getFromCache(file) {
        let code;
        if(this.cache.has(file)) {
            code = this.cache.get(file);
        }
        else {
            code = fs.readFileSync(file, 'utf8');
            this.cache.set(file, code);
        }
        return code;
    }
}
let test;
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
    fileCache;
    constructor(fileCache) {
        if(!fileCache){
            this.fileCache = new FileCache();
        }
    }
    async render(document) {
        const dom = linkedom.parseHTML(document, {
            get history() {
                return {
                    get location() { return { pathname: '/' }; }
                };
            },
            get location() { return { pathname: '/' }; }
        });
        test = dom;
        const context = dom;
        
        context.self = dom;
        context.global = dom;

        vm.createContext(context);
        const scripts = dom.document.getElementsByTagName("script");
        scripts.forEach((script) => {
            vm.runInContext(this.fileCache.getFromCache('dist/linkedom-angular/browser/' + script.src), context);
        });

        await new Promise(r => setTimeout(r, 0));
        
        return dom.document.toString()
    }
}

module.exports = { Engine }