import apiRequest from './api-request';
//import briefing from './briefing';
import ServiceWorkerReceiver from './sw-receive';

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('install', function(event) {
    return self.skipWaiting();
})


ServiceWorkerReceiver.bind('get-notification-status', () => {
    return self.registration.pushManager.getSubscription()
    .then((sub) => {
        if (!sub) {
            return Promise.resolve(false)
        }
        return apiRequest('/get-subscriptions', 'POST',{type: 'web', data: sub})
        .then((topics) => {
            return topics.indexOf('test') > -1;
        })
    })
})

ServiceWorkerReceiver.bind('subscribe', (subscription) => {
    return apiRequest('/subscription/test','POST', {
        type: 'web',
        data: subscription
    })
    .then((res) => {
        return res.success === true;
    })
})

ServiceWorkerReceiver.bind('unsubscribe', (subscription) => {
    return apiRequest('/subscription/test','DELETE', {
        type: 'web',
        data: subscription
    })
    .then((res) => {
        return res.success === true;
    })
})


// let clientPorts = [];

// let sendToClients = function(message) {
//     clients.matchAll().then((clientList) => {
//         clientList.forEach((c) => c.postMessage(message))
//     })
//     // console.log("Sending to " + clientPorts.length + " clients", message);
//     // clientPorts.forEach((p) => p.postMessage(message));
// }

// let isSubbed = null;

// let checkSubscription = function() {
//     return self.registration.pushManager.getSubscription()
//     .then((sub) => {
//         if (!sub) {
//             return Promise.resolve(false)
//         }
//         return apiRequest('/get-subscriptions', 'POST',{type: 'web', data: sub})
//         .then((topics) => {
//             return topics.indexOf('test') > -1;
//         })
//     })
//     .then((isSubscribed) => {
//         isSubbed = isSubscribed;
//     })
   
// };

// let unregister = function() {
//     return self.registration.pushManager.getSubscription()
//     .then((sub) => {
//         if (!sub) return sendToClients('unsub');
       
//         return apiRequest('/subscription/test','DELETE', {
//             type: 'web',
//             data: sub
//         })
//         .then((res) => {
//             sendToClients('unsub');
//         })
//         .catch((err) => {
//             console.log(err)
//         })
//     })
// }

// let register = function() {
//     return self.registration.pushManager.getSubscription()
//     // .then((sub) => {
//     //     if (sub === null) {
//     //         return self.registration.pushManager.subscribe({userVisibleOnly: true});
//     //     }
//     //     return sub;
//     // })
//     .then(function(subscription) {
//         console.log(JSON.stringify(subscription, null, 2));
//         return apiRequest('/subscription/test','POST', {
//             type: 'web',
//             data: subscription
//         })
//         .then((res) => {
//             sendToClients('sub');
//         })
//         .catch((err) => {
//             console.error(err)
//         })
//     })
// }

// checkSubscription();

// // self.addEventListener('message', function(event){
  
// //     if (event.data === 'unsub') {
// //         unregister();
// //     }
    
// //     if (event.data === 'sub') {
// //         register();
// //     }
    
// //     if (event.data === 'ping') {
// //         sendToClients(isSubbed ? 'sub' : 'unsub')
// //     }
    
// //     if (event.data === 'briefing') {
// //         new briefing(self).start();
// //     }
    
// // });



// self.addEventListener('push', function(event) {
//   var obj = event.data.json();
//   console.log('response',obj, typeof obj[1])
  
//   self.registration.showNotification.apply(self.registration, obj);  
// });

// self.addEventListener('install', function(event) {
//     //event.replace();   
//     return self.skipWaiting();
// })

// self.addEventListener('activate', function(event) {
//     console.log('claiming', event)
//   // Calling claim() to force a "controllerchange" event on navigator.serviceWorker
//   event.waitUntil(self.clients.claim()
//   .then(() => {
//       return checkSubscription()
//   })
//   .then((issub) => {
//         sendToClients(issub ? 'sub' : 'unsub');
        
//         self.registration.getNotifications()
//         .then((list) => {
//             console.log(list)
//             list.forEach((n) => n.close())
//         })
        
//   }))
  
// });