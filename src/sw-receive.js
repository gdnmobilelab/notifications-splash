
let boundFuncs = {};

self.addEventListener('message', function(event){

    let ret = (err, data) => {
        event.ports[0].postMessage([err, data]);
    }
    console.log(event.data)
    let {command, dataAsJSON} = event.data;
    
    let data = null;
    if (dataAsJSON) {
        data = JSON.parse(dataAsJSON);
    }
    
    if (!boundFuncs[command]) {
        console.warn(`Fired command ${command}, but no function was bound to it.`);
        return;
    }
    
    boundFuncs[command](data)
    .then((data) => {
        event.ports[0].postMessage([null, data]);
    })
    .catch((err) => {
        event.ports[0].postMessage([err, null]);  
    })
    
});



export default {
    bind(command, func) {
        if (boundFuncs[command]) {
            throw new Error("Already have a function bound to " + command);
        }
        boundFuncs[command] = func;
    },
    unbind(command, func) {
        if (boundFuncs[command] !== func) {
            throw new Error(`Trying to unbind function from ${command} when it is not bound.`)
        }
        boundFuncs[command] = null;
    }
};