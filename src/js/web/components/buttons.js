import apiRequest from '../../shared/api-request';
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
        
        // <button className={sampleClass} onClick={this.runSample} disabled={this.state.notificationsEnabled !== "yes"}>Sample alert</button>
        
        return <div>
            <button className={buttonClassName} onClick={buttonClick}>{buttonText}</button>
            
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
        runServiceWorkerCommand("commandSequence", {sequence: SampleCommand});
    }

    
    componentDidMount() {
        
        return runServiceWorkerCommand('pushy.getSubscribedTopics')
            .then((topics) => {
                this.setState({
                    notificationsEnabled: topics && topics.indexOf(config.TOPIC_ID) > -1 ? 'yes' : 'no'
                })
            })
            .then(() => {
                runServiceWorkerCommand("analytics", {
                    t: 'pageview',
                    dh: window.location.hostname,
                    dp: window.location.pathname,
                    dt: 'Sign up page'
                })
            })
            .catch((err) => {
                console.error(err)
            })
    }
};