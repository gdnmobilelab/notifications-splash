import React from 'react';
import runServiceWorkerCommand from 'service-worker-command-bridge/client';
import MultiTopicContainer from './multi-topic-component';
import Loading from './loading-component';
import SampleCommand from '../sample-command.json';
import SubscriptionService from '../services/SubscriptionService';

class TopicsPageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            subscribedTopics: [],
            enabled: false,
            error: false
        }
    }

    setUnsubscribe(topicId) {
        let subscribedTopics = this.state.subscribedTopics.filter((t) => t !== topicId);
        this.setState({subscribedTopics: subscribedTopics});
    }

    setSubscribe(topicId) {
        this.setState({subscribedTopics: this.state.subscribedTopics.concat([topicId])});
    }

    addToSubscribedTopics(topicId) {
        SubscriptionService.subscribe(topicId)
            .catch((error) => {
                this.setUnsubscribe(topicId);
            });
        this.setSubscribe(topicId);
    }

    removeFromSubscribedTopics(topicId) {
        SubscriptionService.unsubscribe(topicId)
            .catch((error) => {
                this.setSubscribe(topicId);
                console.error(error);
            });
        this.setUnsubscribe(topicId);
    }

    runSample() {
        runServiceWorkerCommand("commandSequence", {sequence: SampleCommand});
    }

    render() {
        var showLoading = !this.state.enabled && !this.state.error ? <Loading /> : '',
            showError = this.state.error ? <p style={{"color": "red"}}>There was an error fetching your subscribed topics. Please try again later</p> : '';

        return (
            <div>
                {showError}
                <h2 style={{fontSize: "28px", fontWeight: "bold", color: "#333"}}>Presidential Debates</h2>
                <p>Tap the toggle below to follow along with the demo!</p>
                <MultiTopicContainer
                    picks={this.state.subscribedTopics}
                    enabled={this.state.enabled}
                    onPick={this.addToSubscribedTopics.bind(this)}
                    onRemovePick={this.removeFromSubscribedTopics.bind(this)}
                />
                <p style={{color: "rgb(153, 153, 153)"}}>
                    Learn more about the Guardian Mobile Innovation Lab and our past and future experiments on <a href="https://medium.com/the-guardian-mobile-innovation-lab">Medium</a>.
                </p>
                {showLoading}
            </div>
        )
    }

    componentDidMount() {
        runServiceWorkerCommand('pushy.getSubscribedTopics')
            .then((topics) => {
                console.log(topics);
                this.setState(Object.assign({}, {enabled: true, subscribedTopics: topics || []}));
            })
            .catch((err) => {
                console.error(err);
                this.setState(Object.assign({}, {error: true}));
            })
    }
}

export default TopicsPageComponent