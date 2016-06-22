import analytics from 'google-analytics-protocol';
import './take-control';
import swBridge from 'service-worker-command-bridge/service-worker';
import config from '../shared/config';
import notificationCommands from 'notification-commands';
import PromiseTools from 'promise-tools';

analytics.setAnalyticsID(config.GA_ID);

notificationCommands.setConfig({
    poll: {
        key: config.POLL_API_KEY,
        host: config.POLL_API_HOST
    },
    pushy: {
        key: config.API_KEY,
        host: config.API_HOST
    }
})
notificationCommands.register(swBridge);

swBridge.bind("capability-check", () => {
    // Apparently this is the only reliable way to detect if the browser
    // supports message payloads (i.e., Chrome 50+)
    return 'PushMessageData' in self;  
})

swBridge.bind("analytics", analytics);