export default function (command, data) {
    
    // Wrap our postMessage in a promise to allow us to chain commands and
    // responses together.
    
    return new Promise((fulfill, reject) => {
        let messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
            let [err, data] = event.data;
            if (err) {
                return reject(err);
            }
            
            fulfill(data);
        };
        
        let dataAsJSON = JSON.stringify(data);
        navigator.serviceWorker.controller.postMessage({command, dataAsJSON}, [messageChannel.port2]);
    })
}