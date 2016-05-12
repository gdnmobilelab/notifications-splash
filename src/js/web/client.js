import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import ServiceWorkerRun from './sw-run';
import Buttons from './components/buttons';

const contentSwitch = document.getElementById('content-switch');
const reactContainer = document.getElementById("react-container");

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

const canRunExperiment = () => {
    
    // If we don't have notifications or service workers, we can't proceed.
    if (!window.Notification || !window.Notification.requestPermission || !navigator.serviceWorker) {
        return Promise.resolve(false);
    }
    
    // We also need to check whether our service worker supports payloads in notifications (i.e. is >= Chrome 50)
    return ServiceWorkerRun('capability-check');
}

canRunExperiment()
.then((isCapable) => {
    let className = "can-run-experiment";
    
    if (isCapable === false) {
        if (navigator.userAgent.indexOf("Linux; Android") > -1 && navigator.userAgent.indexOf("Chrome/") > -1) {
            className = "chrome-low-version";
        } else {
            className = "not-chrome";
        }
        
        // can't do service worker GA, so do manual
        
        (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,"script","https://www.google-analytics.com/analytics.js","ga");
        
        ga('create', config.GA_ID, 'auto');
        ga('send', 'pageview');
        
    } else {
        ReactDOM.render(React.createElement(Buttons), reactContainer); 
    }
    
    contentSwitch.className = className;
})