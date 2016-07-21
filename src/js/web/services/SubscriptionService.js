import runServiceWorkerCommand from 'service-worker-command-bridge/client';

class SubscriptionService {
    getOrCreateSubscription(reg) {
        return reg.pushManager.getSubscription()
            .then((sub) => {
                if (sub !== null) {
                    return sub;
                }
                return reg.pushManager.subscribe({userVisibleOnly: true});
            })

    }

    unsubscribe(topic) {
        return navigator.serviceWorker.ready
            .then((reg) => {
                return reg.pushManager.getSubscription()
            })
            .then((sub) => {
                return runServiceWorkerCommand('pushy.unsubscribeFromTopic', {
                    topic: topic
                });
            })
            .then(() => {
                return runServiceWorkerCommand('analytics', {
                    t: 'event',
                    ec: 'Subscription',
                    ea: 'unsubscribe'
                });
            })

    }

    subscribe(topic) {
        return new Promise((fulfill, reject) => {
            if (window.Notification.permission === 'granted') {
                return fulfill(true);
            }
            Notification.requestPermission((status) => {
                if (status === 'granted') {
                    return fulfill(true);
                }
                reject(new Error(status))
            })
        })
            .then(() => {
                return navigator.serviceWorker.ready;
            })
            .then((reg) => {
                return this.getOrCreateSubscription(reg);
            })
            .then((sub) => {
                return runServiceWorkerCommand('pushy.subscribeToTopic', {
                    topic: topic,
                    confirmationNotification: [
                        {
                            "command": "notification.show",
                            "options": {
                                "title": "Subscription confirmed",
                                "options": {
                                    body: "You have signed up to receive notifications from the Guardian Mobile Innovation Lab.",
                                    icon: "https://www.gdnmobilelab.com/images/mobilelab-logo-thick.png",
                                    tag: "signup-confirmation"
                                }
                            }
                        }
                    ]
                });
            })
            .then(() => {
                runServiceWorkerCommand('analytics', {
                    t: 'event',
                    ec: 'Subscription',
                    ea: 'subscribe'
                });
            })
    }
}

export default new SubscriptionService()