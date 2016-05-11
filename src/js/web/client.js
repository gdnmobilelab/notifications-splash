import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import apiRequest from '../shared/api-request';
import ServiceWorkerRun from './sw-run';
import Toggle from './components/toggle';
import SampleCommand from './sample-command.json';

let rootEl = document.createElement("div");
document.body.appendChild(rootEl);

const canRunExperiment = () => {
    
    // If we don't have notifications or service workers, we can't proceed.
    
    if (!window.Notification || !window.Notification.requestPermission || !navigator.serviceWorker) {
        return Promise.resolve(false);
    }
    
    // We also need to check whether our service worker supports payloads in notifications (i.e. is >= Chrome 50)
    return ServiceWorkerRun('capability-check');
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
}


class NotificationSwitch extends React.Component {
    
    constructor() {
        super();
        this.state = {
            canUseNotifications: window.Notification && window.Notification.requestPermission,
            notificationsEnabled: 'unknown',
            animateToggles: false
        }
    }
    
    render() {
        return <div>
            <div id='logo'></div>
            <h4>Mobile Lab</h4>
            <h1>Notification Test</h1>
            <p>We're running some experiments with notifications we can send directly from a web site.</p>
            {this.state.cannotRun === true ? this.getIncapableError() : this.getInner()}
        </div>
    }
    
    getIncapableError() {
        if (navigator.userAgent.indexOf("Linux; Android") > -1 && navigator.userAgent.indexOf("Chrome/") > -1) {
            return <div>
                <p>
                    To participate in the experiment you need to be running the latest version of Chrome.
                    Plese update from the Play store here:
                </p>
                <a href="https://play.google.com/store/apps/details?id=com.android.chrome" className='as-button'>
                    Update Chrome
                </a>
            </div>
        } else if (navigator.userAgent.indexOf("Chrome/") > -1) {
            return <p>
                You need to be running the latest version of Chrome - please update (by going to the About menu)
                to ensure you can upgrade to Chrome 50 or higher.
            </p>
        } else {
            return <p>
                Unfortunately you can only participate if you have an Android phone running the Chrome
                browser. However, if you want to see the notifications, you can sign up with Chrome on your
                desktop machine.
            </p>
        }
    }
    
    getInner() {
        
        let buttonText = "Enable notifications";
        let buttonClick = this.notificationSwitch.bind(this);
        let buttonClassName = '';
        
        if (this.state.notificationsEnabled === 'unknown') {
            buttonText = "Checking...";
            buttonClick = null;
            buttonClassName = 'disabled';
        } else if (this.state.notificationsEnabled === 'yes') {
            buttonClassName = 'active';
            buttonText = "Disable notifications";
        }
        
        let sampleClass = this.state.notificationsEnabled === "yes" ? "" : "disabled"
        
        // <Toggle
        //         text={buttonText}
        //         disabled={buttonDisabled}
        //         value={buttonActive}
        //         animate={this.state.animateToggles}
        //         onClick={this.notificationSwitch.bind(this)}
        //     />
        return <div>
            <p>Our first experiment will be for the jobs report on Friday. Sign up by hitting the button:</p>
            <button className={buttonClassName} onClick={buttonClick}>{buttonText}</button>
            <button className={sampleClass} onClick={this.runSample} disabled={this.state.notificationsEnabled !== "yes"}>Run jobs report test</button>
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
        console.log(SampleCommand)
        ServiceWorkerRun("commands", SampleCommand);
    }

    
    componentDidMount() {
        
        canRunExperiment()
        .then((isCapable) => {
            if (!isCapable) {
                return this.setState({
                    cannotRun: true
                });
            }
            
            return ServiceWorkerRun('get-notification-status')
            .then((isEnabled) => {
                this.setState({
                    notificationsEnabled: isEnabled ? 'yes' : 'no'
                })
            })
            .then(() => {
                ServiceWorkerRun('analytics', {
                    t: 'pageview',
                    dh: 'www.stg.gdnmobilelab.com',
                    dp: '/apps/pushy-demo',
                    dt: 'Sign up page'
                })
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
            console.error(err);
             this.setState({
                notificationsEnabled: 'yes',
                animateToggles: true
            })
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
            console.error(err);
            this.setState({
                notificationsEnabled: 'no',
                animateToggles: true
            })
        })
    }
};

// navigator.serviceWorker.ready.then(() => {
   ReactDOM.render(React.createElement(NotificationSwitch), rootEl); 
// });