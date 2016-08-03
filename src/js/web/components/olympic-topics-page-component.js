import React from 'react';
import runServiceWorkerCommand from 'service-worker-command-bridge/client';
import TopicComponent from './topic-component';
import CountryCompetitionContainer from './country-competition-container';


class OlympicsTopicsPageComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            subscribedTopics: [],
            enabled: false
        }
    }

    addToSubscribedTopics(topic) {
        this.setState({subscribedTopics: this.state.subscribedTopics.concat([topic])});
    }

    removeFromSubscribedTopics(topic) {
        let subscribedTopics = this.state.subscribedTopics.filter((t) => t !== topic);
        this.setState({subscribedTopics: subscribedTopics});
    }


    render() {
        return (
            <div>
                <p>Throughout the Olympics, we’ll be sending experimental notifications.</p>
                <p><strong>Sign up below by tapping the toggle.</strong></p>
                <TopicComponent
                    picks={this.state.subscribedTopics.filter((c) => c === 'olympics_notifications')}
                    topics={[
                        {
                            id: 'olympics_notifications',
                            name: 'Get daily medal counts, news quizzes and a live morale meter during big events.'
                        }
                    ]}
                    onPick={this.addToSubscribedTopics.bind(this)}
                    onRemovePick={this.removeFromSubscribedTopics.bind(this)}
                    enabled={this.state.enabled}
                />
                <p>Get real-time medal notifications for up to three countries. Note: includes SPOILERS!</p>
                <CountryCompetitionContainer
                    picks={this.state.subscribedTopics}
                    enabled={this.state.enabled}
                    onPick={this.addToSubscribedTopics.bind(this)}
                    onRemovePick={this.removeFromSubscribedTopics.bind(this)}
                />
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
            })
    }
}

export default OlympicsTopicsPageComponent