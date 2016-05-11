//import JSONPath from 'jsonpath/jsonpath.js';
import db from './db';
import PromiseTools from 'promise-tools';
import analytics from './analytics';

const mapActionsToNotification = function(notification, actions) {
    notification.actions = [];
    notification.data = notification.data || {};
    notification.data.commands = [];
    notification.data.commandToActionLabelMap = {};
    notification.actions = [];
    
    actions.forEach((action) => {
        let actionIndexes = [];
        action.commands.forEach((command) => {
            actionIndexes.push(notification.data.commands.length);
            notification.data.commands.push(command);
        });
        
        let commandString = "__command::" + actionIndexes.join(',')
        
        notification.actions.push(Object.assign(action.template, {
            action: commandString
        }));
        
        // We use this in analytics to track which button was actually pressed
        notification.data.commandToActionLabelMap[commandString] = action.template.title;
    })
}

const commands = {
    "storeChains": function(opts) {
        return fetch(opts.url, {
           // credentials: 'include'
        })
            .then((res) => res.json())
            .then((json) => {
                return PromiseTools.map(json, (chain) => {
                    return commands.storeChain(chain);
                })
            })
    },
    "storeChain": function(opts) {
        return db.notificationChains
            .where("chain")
            .equals(opts.chain)
            .delete()
            
        .then(() => {
            console.log('deleted')
            if (opts.url) {
                return fetch(opts.url, {
                  //  credentials: 'include'
                })
                .then((res) => res.json());
            }
            return opts.values;
        })
        .then((json) => {
            
            json.forEach((obj, idx) => {
                obj.chain = opts.chain;
                obj.index = idx;
            })
            return db.notificationChains.bulkAdd(json);
        })
    },
    "notificationFromChain": function(opts) {
        return db.notificationChains
            .where("chain")
            .equals(opts.chain)
            .and((c) => c.read !== true)
            .sortBy("index")
        .then((results) => {
            return results[0];
        })
        .then((chainEntry) => {
            
            // chain notifications need to follow a specific format
            
            let sameChainCommand = chainEntry.actions.find((c) => c.label === "sameChain");
            let switchChainCommand = chainEntry.actions.find((c) => c.label === "switchChain");
            let linkCommands = chainEntry.actions.filter((c) => c.label === "web-link");
            
            // now we have our commands we need to check whether either of those
            // chains still have entries in them.
            
            return PromiseTools.parallel([
                function() {
                    
                    // sometimes we don't actually have a same chain command - e.g. if we
                    // know it is the end of the chain.
                    
                    if (!sameChainCommand) return -1;
                    return db.notificationChains
                        .where("chain")
                        .equals(opts.chain)
                        .and((entry) => entry.read !== true)
                        .count()
                },
                function() {
                    if (!switchChainCommand) return -1;
                    return db.notificationChains
                        .where("chain")
                        .equals(switchChainCommand.switchTo)
                        .and((entry) => entry.read !== true)
                        .count()
                }
            ])
            .then(([sameChainLength, switchedChainLength]) => {
                let actions = [];
                
                // now we know which commands we can actually use. If they have
                // at least one item in the array, we'll use them. 
                
                if (sameChainLength > 1) {
                    actions.push(sameChainCommand);
                }
                if (switchedChainLength > 0) {
                    if (chainEntry.actions.indexOf(sameChainCommand) > chainEntry.actions.indexOf(switchChainCommand)) {
                        actions.unshift(switchChainCommand);
                    } else {
                        actions.push(switchChainCommand);
                    }
                    
                }
                
                if (actions.length === 0) {
                    // If neither have any items left, we show the article link.
                    actions.push(linkCommands[0]);
                    actions.push(linkCommands[1]);
                }
                
                
                
                
                
                return db.notificationChains
                    .update(chainEntry.id, {read: true})
                .then(() => {
                    return commands.showNotification({
                        title: chainEntry.title,
                        options: chainEntry.notificationTemplate,
                        actionCommands: actions
                    })
                })
                
            })
            
            
            

        })

    },
    showNotification: function(opts) {
        
        if (opts.actionCommands) {
            mapActionsToNotification(opts.options, opts.actionCommands);
        }
        
        return self.registration.showNotification(opts.title, opts.options)
        .then(() => {
            analytics.command({
                t: 'event',
                ec: 'Notification',
                ea: 'show',
                el: opts.title
            })
        })
    },
    subscribeToTopic: function(opts) {
        return self.registration.pushManager.getSubscription()
        .then((sub) => {
            return apiRequest(`/topics/${opts.topic}/subscriptions`,'POST', {
                type: 'web',
                data: sub,
                confirmationNotification: opts.confirmationNotification
            })
        })
    },
    closeNotification: function(opts, event) {
        if (opts && opts.tag) {
            return self.registration.getNotifications({tag: opts.tag})
            .then((notifications) => {
                notifications.forEach((n) => n.close());
            })
        }
        event.notification.close();
        return Promise.resolve();
    },
    handleNotificationAction: function(event) {
        let commandIndexes = event.action.split("::")[1].split(',').map((str) => parseInt(str, 10));
        
        let commandArray = commandIndexes.map((idx) => {
            let instruction = event.notification.data.commands[idx];
            return function() {
                return commands[instruction.command](instruction.options, event);
            }
        });
        
        return PromiseTools.series(commandArray)
        .then(() => {
            let actionLabel = event.notification.data.commandToActionLabelMap[event.action];

            analytics.command({
                t: 'event',
                ec: 'Notification',
                ea: 'tap-action',
                el: actionLabel
            })
        })
    },
    openURL: function({url}) {
        return clients.openWindow(url);
    },
    analytics: analytics.command
}

export default commands;