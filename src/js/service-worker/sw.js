import apiRequest from '../shared/api-request';
import ServiceWorkerReceiver from './sw-receive';
import commands from './commands';
import PromiseTools from 'promise-tools';

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim())
    
    // commands.storeChains({ 
    //     url: '/test-note.json'
    // })
    // .then(() => {
    //     return commands.notificationFromChain({
    //         chain: 'good'
    //     });
    // })
    // .catch((err) => {
    //     console.error('err?',err);
    // })
});

let mapCommandsToPromises = function(commandsToRun, event) {
  let promisesToExecute = commandsToRun.map((instruction) => {
      return () => commands[instruction.command](instruction.options, event);
  })
  return PromiseTools.series(promisesToExecute);
}

self.addEventListener('notificationclick', function(event) {
    if (event.action === '' && event.notification.data && event.notification.data.onTap) {
        event.waitUntil(mapCommandsToPromises(event.notification.data.onTap, event));
    }
    
    if (event.action.indexOf('__command') === 0) {
        event.waitUntil(commands.handleNotificationAction(event));
    }
})

self.addEventListener('notificationclose', function(event) {
    
    event.waitUntil(
        Promise.resolve()
        .then(() => {
            if (!event.notification.data || !event.notification.data.onClose) {
                return
            }
            return mapCommandsToPromises(event.notification.data.onClose)
        })
        .then(() => {
            commands.analytics({
                t: 'event',
                ec: 'Notification',
                ea: 'close',
                el: event.notification.title
            })
        })
    )

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
        return apiRequest('/get-subscriptions', 'POST', {type: 'web', data: sub})
        .then((topics) => {
            return topics.indexOf('pushy_demo') > -1;
        })
    })
})

ServiceWorkerReceiver.bind('subscribe', (subscription) => {
    return apiRequest('/topics/test/subscriptions','POST', {
        type: 'web',
        data: subscription,
        confirmationNotification: [
            {
                "command": "showNotification",
                "options": {
                    "title": "Subscription confirmed",
                    "options": {
                        body: "You have signed up to receive alerts from the mobile lab.",
                        icon: "https://www.gdnmobilelab.com/images/mobilelab-logo-thick.png"
                    }
                }
            }
        ] 
    })
    .then((res) => {
        if (res.success !== true) {
            throw new Error("Bad response from API")
        }
    })
})

ServiceWorkerReceiver.bind('capability-check', () => {
    // Apparently this is the only reliable way to detect if the browser
    // supports message payloads (i.e., Chrome 50+)
    return 'PushMessageData' in self;  
})

ServiceWorkerReceiver.bind('unsubscribe', (subscription) => {
    return apiRequest('/topics/test/subscriptions','DELETE', {
        type: 'web',
        data: subscription
    })
    .then((res) => {
        if (res.success !== true) {
            throw new Error("Bad response from API")
        }
    })
})

ServiceWorkerReceiver.bind("commands", (commands) => {
    return mapCommandsToPromises(commands);
})

for (let command in commands) {
    ServiceWorkerReceiver.bind(command, commands[command]);
}

self.addEventListener('push', function(event) {
  let obj = event.data.json();
  console.log("received push", obj)
  
  event.waitUntil(
      mapCommandsToPromises(obj)
  );
});
