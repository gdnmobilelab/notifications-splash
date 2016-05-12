import generateGUID from './guid';
import db from './db';
import querystring from 'query-string';
import PromiseTools from 'promise-tools';
import config from '../shared/config';

let cachedGUID = null;
let syncIsRunning = false;

const analytics = {
    getGuid() {
        if (cachedGUID) {
            return Promise.resolve(cachedGUID);
        }
        return db.guids.get("analytics-guid")
        .then((guidResponse) => {
            if (guidResponse) {
                // We already have the unique client GUID
                return guidResponse.guid;
            }
            let newGuid = generateGUID();
            return db.guids.add({name: "analytics-guid", guid: newGuid})
            .then((newObj) => {
                return newGuid;
            })
        })
        .then((guid) => {
            cachedGUID = guid;
            return guid;
        })
    },
    command(opts) {
        return analytics.getGuid()
        .then((guid) => {
            let data = Object.assign({
                v: 1,
                tid: config.GA_ID,
                cid: guid
            }, opts);
            
            // Rather that send immediately we put it in our db. Then run the sync command
            // this way, we cache any failed calls offline, to be sent the next time an
            // analytics call is attempted.
            
            return db.analyticsPings.add({
                call: data,
                time: Date.now()
            })
            .then(() => {
                // We do NOT have a return here as we don't want the promise chain to be caught
                // up in sync. It can run by itself.
                analytics.sync();
                return true;
            })
        })
    },
    sync() {
        if (syncIsRunning) {
            // Only want this to run one at a time, avoid duplicate requests
            return;
        }
        return db.analyticsPings.toArray()
        .then((allCalls) => {
            
            if (allCalls.length === 0) {
                return;
            }
            
            allCalls.forEach((c) => {
                
                let call = c.call;
                
                // qt time specifies the offset of when the event occurred:
                // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#qt
                
                call.qt = Date.now() - c.time;
                
                // turn our cached calls into querystring-ified strings
                c.callFormatted = querystring.stringify(call)
            });
            
            // /batch only allows 20 requests per batch call. Rare that we'll hit that, but just in case...
            let callBatchesOf20 = [];
            
            while (allCalls.length > 0) {
                callBatchesOf20.push(allCalls.splice(0,20));
            }
            
            return PromiseTools.map(callBatchesOf20, (batch) => {
                return fetch("https://www.google-analytics.com/batch", {
                    method: "POST",
                    body: batch.map((c) => c.callFormatted).join('\n')
                })
                .then((res) => {
                    // Only deleted cached copies if this was a success
                    if (res.status !== 200) {
                        throw new Error("Analytics call failed");
                    }
                    let allIds = batch.map((c) => c.id);
                    return db.analyticsPings.where('id').anyOf(allIds).delete();
                })
            }, 10) // 10 HTTP calls at a time
            .then(() => {
                // Sync is complete. But some might have been added while we were processing
                // those requests. So let's run sync again, assuming it'll just do an early exit
                // with 0 cached requests - but it might not.
                return analytics.sync();
            })
            
            
        })
        
    }
}

export default analytics;