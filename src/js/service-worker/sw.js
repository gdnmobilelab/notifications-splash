import analytics from 'google-analytics-protocol';
import './take-control';
import swBridge from 'service-worker-command-bridge/service-worker';
import config from '../shared/config';
import notificationCommands from 'notification-commands';

analytics.setAnalyticsID(config.GA_ID);

notificationCommands.setConfig({
    ballot: {
        key: config.ballot.API_KEY,
        host: config.ballot.API_HOST
    },
    pushy: {
        key: config.pushy.API_KEY,
        host: config.pushy.API_HOST
    }
});

notificationCommands.register(swBridge);

swBridge.bind("capability-check", () => {
    // Apparently this is the only reliable way to detect if the browser
    // supports message payloads (i.e., Chrome 50+)
    return 'PushMessageData' in self;  
})

swBridge.bind("analytics", analytics);