import React from 'react';
import TopicComponent from './topic-component';
import topics from '../topic-list';

class MultiTopicComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            orderedTopics: topics,
            topics: topics,
            enabled: false,
            search: '',
        }
    }

    search(e) {
        var re,
            filteredTopics = this.state.orderedTopics.filter((topic) => {
                re = new RegExp(e.target.value,"gi");
                return topic.name.search(re) !== -1 || topic.id.search(re) !== -1
            }),
            topicsWithoutPicks = filteredTopics.filter((topic) => {
                return this.props.picks.indexOf(topic.id) < 0
            }),
            picks = this.state.orderedTopics.filter((topic) => {
                return this.props.picks.indexOf(topic.id) >= 0
            }),
            combined = [];
            if (e.target.value !== '') {
                combined = combined.concat(topicsWithoutPicks)
                            .concat(picks)
                            .concat(this.state.orderedTopics.filter((topic) => {
                                return !filteredTopics.find((t) => t.id === topic.id);
                            }));
            } else {
                combined = combined.concat(picks).concat(topicsWithoutPicks);
            }


        this.setState({topics: combined, search: e.target.value});
    }

    componentWillReceiveProps(props) {
        //Oof.
        if (props.enabled && !this.state.enabled) {
            //Avoiding a race condition by placing this here
            //instead of componentDidMount (the component may have mounted but we async call for
            //topics, so they may not have been passed to the component at the time of mounting).
            let withoutPicks = this.state.orderedTopics.filter((topic) => {
                return props.picks.indexOf(topic.id) < 0
            }),
                picks = this.state.orderedTopics.filter((topic) => {
                    return props.picks.indexOf(topic.id) >= 0
                }),
                combined = [].concat(picks).concat(withoutPicks);

            this.setState(Object.assign({}, this.state, {topics: combined, countries: combined, enabled: true}));
        }
    }

    render() {
        let recommended = this.state.topics.find((topic) => topic.recommended);
        let recommendedFirst = this.state.topics;

        if (recommended && this.state.search === '') {
            recommendedFirst = recommendedFirst.filter((topic) => !topic.recommended);
            recommendedFirst.unshift(recommended);
        }

        return (
            <TopicComponent
                picks={this.props.picks.filter((p) => topics.find((c) => c.id === p))}
                topics={recommendedFirst}
                enabled={this.props.enabled}
                onPick={this.props.onPick}
                onRemovePick={this.props.onRemovePick}
            />
        )
    }

    componentDidMount() {

    }
}

export default MultiTopicComponent