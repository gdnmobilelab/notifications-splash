import Dexie from 'dexie';

const db = new Dexie("pushy-demo");

db.version(1)
    .stores({
        "notificationChains": "++id, chain, index"
    })

db.version(2)
    .stores({
        "notificationChains": "++id, chain, index",
        "analyticsPings": "++id",
        "guids": "&name" // no cookie or localStorage access. Where else can we put this?!
    })
    .upgrade(function() {
        
    })
    
export default db;