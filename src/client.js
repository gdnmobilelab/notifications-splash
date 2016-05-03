import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import apiRequest from './api-request';
import ServiceWorkerRun from './sw-run';

let rootEl = document.createElement("div");
document.body.appendChild(rootEl);

// ServiceWorkerRun('blah', {
//     'test': 'test'
// })
// .then((data) => {
//     console.log('it worked', data)
// })

// catch before render completes

navigator.serviceWorker.register('./sw.js');

class NotificationSwitch extends React.Component {
    
    constructor() {
        super();
        this.state = {
            canUseNotifications: window.Notification && window.Notification.requestPermission,
            notificationsEnabled: 'unknown'
        }
    }
    
    render() {
        return <div>
            <h1>Notification Test</h1>
            <p>This is version 2.</p>
            {this.getInner()}
        </div>
    }
    
    getInner() {
        if (this.state.canUseNotifications === false){
            return <p>You phone does not support web notifications</p>
        } else if (this.state.notificationsEnabled === 'unknown') {
            return <p>Checking notification state...</p>
        } else {
            return <div>
                <p>Notifications are currently {this.state.notificationsEnabled === 'yes' ? 'ON' : 'OFF'}.</p>
                <button onClick={this.notificationSwitch.bind(this)}>Turn notifications {this.state.notificationsEnabled === 'yes' ? 'OFF' : 'ON'}</button>
                <button onClick={this.briefing}>Try Briefing concept</button>
               </div>
               
        }
    }
     
    notificationSwitch() {
        if (this.state.notificationsEnabled === 'yes') {
            this.unsubscribe();
        } else {
            this.subscribe();
        }
    }

    
    componentDidMount() {
        console.log('didmount')
        ServiceWorkerRun('get-notification-status')
        .then((isEnabled) => {
            this.setState({
                notificationsEnabled: isEnabled ? 'yes' : 'no'
            })
        })
        // navigator.serviceWorker.addEventListener('message', (event) => {
        //     console.log(event)
        //     if (event.data === 'sub') {
        //         this.setState({
        //             notificationsEnabled: 'yes'
        //         })
        //     } else if (event.data === 'unsub') {
        //         this.setState({
        //             notificationsEnabled: 'no'
        //         })
        //     }
        // });
        
        // navigator.serviceWorker.ready.then(() => {
        //     navigator.serviceWorker.controller.postMessage('ping');
        // })
    
    }
    

    
    unsubscribe() {
        navigator.serviceWorker.controller.postMessage('unsub');
        navigator.serviceWorker.ready
        .then((reg) => {
            //console.log("Unregistering service worker");
            //reg.unregister()
        })
        
    }
    
    subscribe() {
        new Promise((fulfill, reject) => {
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
            return reg.pushManager.getSubscription()
            .then((sub) => {
                if (!sub) {
                    return reg.pushManager.subscribe({userVisibleOnly: true});
                }
                return sub;
            })
        })
        .then((sub) => {
            console.log('sub?', sub)
            ServiceWorkerRun('subscribe', sub);
            
            
            
            
            // .then(function(subscription) {
            //     console.log(JSON.stringify(subscription, null, 2));
            //     return apiRequest('/subscription/test','POST', {
            //         type: 'web',
            //         data: subscription
            //     })
            //     .then((res) => {
            //         console.log(res)
            //     })
            //     .catch((err) => {
            //         console.log(err)
            //     })
            // })
            
            // this.setState({
            //     notificationsEnabled: 'yes'
            // })
        })
        .catch((err) => {
            console.log(err)
        })
    }
};


ReactDOM.render(React.createElement(NotificationSwitch), rootEl);

if (window.location.hash === '#readinglist') {
    alert("Imagine there is a series of articles here.")
    window.location.hash = ''
}