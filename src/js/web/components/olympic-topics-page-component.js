import React from 'react';
import runServiceWorkerCommand from 'service-worker-command-bridge/client';
import TopicComponent from './topic-component';
import CountryCompetitionContainer from './country-competition-container';
import config from '../../shared/config';
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
                <p>Throughout the Rio 2016 Olympics, we’ll be sending experimental notifications.</p>
                <p><strong>Sign up below by tapping the toggle.</strong></p>
                <TopicComponent
                    picks={this.state.subscribedTopics.filter((c) => c === 'olympics_notifications')}
                    topics={[
                        {
                            id: config.TOPIC_ID,
                            name: 'Get a daily leaderboard, news quizzes and a live morale meter during big events.'
                        }
                    ]}
                    onPick={this.addToSubscribedTopics.bind(this)}
                    onRemovePick={this.removeFromSubscribedTopics.bind(this)}
                    enabled={this.state.enabled}
                />
                <button onClick={this.runSample}>Take our Olympics quiz</button>
                <p>Get real-time medal notifications for countries you want to follow. Note: includes SPOILERS!</p>
                <CountryCompetitionContainer
                    picks={this.state.subscribedTopics}
                    enabled={this.state.enabled}
                    onPick={this.addToSubscribedTopics.bind(this)}
                    onRemovePick={this.removeFromSubscribedTopics.bind(this)}
                />
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