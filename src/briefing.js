let items = [
    {
        title: "Donald Trump",
        body: "Most of the world seems to agree a Donald Trump presidency is a disturbing possibility that would inflict unthinkable damage, Guardian reporters found",
        url: "http://www.theguardian.com/us-news/2016/apr/28/donald-trump-president-world-leaders-foreign-relations"
    },
    {
        title: "Solitary confinement",
        body: "US president has introduced federal-level reforms, but without getting states to do likewise their impact will be minimal",
        url: "http://www.theguardian.com/world/2016/apr/28/obama-administration-urges-states-to-curb-use-of-solitary-confinement"
    },
    {
        title: "Prince",
        body: "Singer 'had prescription drugs in his possession when he died'",
        url: "http://www.theguardian.com/music/2016/apr/28/prince-prescription-drugs-possession-death-law-enforcement-source"
    },
    {
        title: "Syria",
        body: "Airstrike on MSF-backed Aleppo hospital kills patients and doctors",
        url: "http://www.theguardian.com/world/2016/apr/28/deadly-airstrike-on-hospital-aleppo-syria-reports-say"
    },
    {
        title: "Thailand",
        body: "British family beaten unconscious in Thailand during holiday",
        url: "http://www.theguardian.com/world/2016/apr/28/british-trio-beaten-unconscious-in-thailand-during-holiday"
    }
]

export default class Briefing {
    constructor(context) {
        this.context = context;
        this.context.addEventListener('notificationclick', this.processClick.bind(this));
    }
    
    start() {
        console.log(Date.now() - (1000 * 60 * 4))
        this.currentItemIndex = -1;
        this.selectedItems = [];
        this.context.registration.showNotification('Daily Briefing', {
            body: "Your daily briefing is ready! Make a reading list for yourself by tapping save or skip on each story.",
            icon: require('./icons-64/097-download.png'),
            actions: [
                {
                    "title": "Start",
                    "action": "skip",
                    "icon": require('./icons-32/285-play3.png')
                },
                {
                    "title": "Not now",
                    "action": "not-now",
                    "icon": require('./icons-32/287-stop2.png')
                }
            ],
            tag: 'briefing-selector',
            timestamp: Date.now() + (1000 * 60 * 4)
        })
    }
    
    showCurrentItem() {
        let item = items[this.currentItemIndex];
        
        this.context.registration.showNotification(item.title, {
            body: item.body,
            icon: require('./icons-64/097-download.png'),
            actions: [
                {
                    "title": "Add to List",
                    "action": "add",
                    "icon": require('./icons-32/218-star-full.png')
                }, {
                    "title": "Skip",
                    "action": "skip",
                    "icon": require('./icons-32/309-arrow-right.png')
                }
            ],
            silent: true,
            tag: "briefing-selector"
        })
    }
    
    addCurrentItem() {
        this.selectedItems.push(items[this.currentItemIndex]);
        let totalReadingTime = this.selectedItems.length * 3 // example
        
        this.context.registration.showNotification('Reading List', {
            body: `${this.selectedItems.length} articles, ${totalReadingTime} minutes`,
            icon: require('./icons-64/032-book.png'),
            tag: 'reading-list',
            silent: true
        })
    }
    
    processClick(e) {
        e.preventDefault();
        if (e.action === 'not-now') {
            e.notification.close();
            return;
        }
        
        if (e.action === 'add') {
            this.addCurrentItem()
        }
        
        if (e.action === 'skip' || e.action === 'add') {
            e.notification.close()
            this.currentItemIndex++;
            if (this.currentItemIndex < items.length) {
                this.showCurrentItem();
            }
            
        }
        
        if (e.action === '' && e.notification.tag === 'reading-list') {
            e.notification.close();
            clients.openWindow('/apps/pushy-demo/#readinglist');
        }
    }
}

let sendToClients = function(message) {
    clients.matchAll().then((clientList) => {
        clientList.forEach((c) => c.postMessage(message))
    })
    // console.log("Sending to " + clientPorts.length + " clients", message);
    // clientPorts.forEach((p) => p.postMessage(message));
}