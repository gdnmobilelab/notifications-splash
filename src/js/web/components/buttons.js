import apiRequest from '../../shared/api-request';
import ServiceWorkerRun from '../sw-run';
import SampleCommand from '../sample-command.json';
import config from '../../shared/config';
import React from 'react';

export default class NotificationSwitch extends React.Component {
    
    constructor() {
        super();
        this.state = {
            canUseNotifications: window.Notification && window.Notification.requestPermission,
            notificationsEnabled: 'unknown',
            animateToggles: false
        }
    }
    
    render() {
        let buttonText = "Enable notifications";
        let buttonClick = this.notificationSwitch.bind(this);
        let buttonClassName = '';
        
        if (this.state.notificationsEnabled === 'unknown') {
            buttonText = "Please wait...";
            buttonClick = null;
            buttonClassName = 'disabled';
        } else if (this.state.notificationsEnabled === 'yes') {
            buttonClassName = 'active';
            buttonText = "Disable notifications";
        }
        
        let sampleClass = this.state.notificationsEnabled === "yes" ? "" : "disabled"
        
        return <div>
            <button className={buttonClassName} onClick={buttonClick}>{buttonText}</button>
            <button className={sampleClass} onClick={this.runSample} disabled={this.state.notificationsEnabled !== "yes"}>Sample alert</button>
        </div>
    }
     
    notificationSwitch(e) {
        if (this.state.notificationsEnabled === 'yes') {
            this.unsubscribe();
        } else {
            this.subscribe();
        }
        e.target.blur();
    }
    
    runSample() {
        ServiceWorkerRun("commands", SampleCommand);
    }

    
    componentDidMount() {
        
        return ServiceWorkerRun('get-notification-status')
            .then((isEnabled) => {
                this.setState({
                    notificationsEnabled: isEnabled ? 'yes' : 'no'
                })
            })
            .then(() => {
                ServiceWorkerRun("analytics", {
                    t: 'pageview',
                    dh: window.location.hostname,
                    dp: window.location.pathname,
                    dt: 'Sign up page'
                })
            })
    }
    

    
    unsubscribe() {
        this.setState({
            notificationsEnabled: 'no',
            animateToggles: true
        })
        return navigator.serviceWorker.ready
        .then((reg) => {
            return reg.pushManager.getSubscription()
        })
        .then((sub) => {
            return ServiceWorkerRun('unsubscribe', sub);
        })
        .catch((err) => {
            this.setState({
                notificationsEnabled: 'yes',
                animateToggles: true
            });
            
            ServiceWorkerRun('analytics', {
                t: 'event',
                ec: 'Subscription',
                ea: 'unsubscribe'
            });
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
            
            this.setState({
                notificationsEnabled: 'yes',
                animateToggles: true
            })
           
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
            return ServiceWorkerRun('subscribe', sub);

        })
        .catch((err) => {
            this.setState({
                notificationsEnabled: 'no',
                animateToggles: true
            })
        })
        .then(() => {
            ServiceWorkerRun('analytics', {
                t: 'event',
                ec: 'Subscription',
                ea: 'subscribe'
            });
        })
    }
};