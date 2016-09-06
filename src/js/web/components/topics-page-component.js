import React from 'react';
import runServiceWorkerCommand from 'service-worker-command-bridge/client';
import MultiTopicContainer from './multi-topic-container';
import Loading from './loading-component';
import SampleCommand from '../sample-command.json';

class OlympicsTopicsPageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            subscribedTopics: [],
            enabled: false,
            error: false
        }
    }

    addToSubscribedTopics(topic) {
        this.setState({subscribedTopics: this.state.subscribedTopics.concat([topic])});
    }

    removeFromSubscribedTopics(topic) {
        let subscribedTopics = this.state.subscribedTopics.filter((t) => t !== topic);
        this.setState({subscribedTopics: subscribedTopics});
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
                <p><strong>Current notification subscriptions</strong></p>
                <MultiTopicContainer
                    picks={this.state.subscribedTopics}
                    enabled={this.state.enabled}
                    onPick={this.addToSubscribedTopics.bind(this)}
                    onRemovePick={this.removeFromSubscribedTopics.bind(this)}
                />
                <p><strong>Recently expired notifications</strong></p>
                <p style={{"color": "#999", "margin": "0.2em"}}>Orlando shootings</p>
                <p style={{"color": "#999", "margin": "0.2em"}}>Istanbul airport attack</p>
                <p style={{"color": "#999", "margin": "0.2em"}}>Super Bowl 2016</p>
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

export default OlympicsTopicsPageComponent