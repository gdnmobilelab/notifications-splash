import React from 'react';
import TopicComponent from './topic-component';
import LocationService from '../services/GeoJSONLocationService';
import countries from '../country-list';

class
CountryCompetitionContainer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            countries: countries,
            topics: countries,
            enabled: false,
            search: '',
        }
    }

    search(e) {
        var re,
            filteredTopics = this.state.countries.filter((topic) => {
                re = new RegExp(e.target.value,"gi");
                return topic.name.search(re) !== -1 || topic.id.search(re) !== -1
            }),
            topicsWithoutPicks = filteredTopics.filter((topic) => {
                return this.props.picks.indexOf(topic.id) < 0
            }),
            picks = this.state.countries.filter((topic) => {
                return this.props.picks.indexOf(topic.id) >= 0
            }),
            combined = [];
            if (e.target.value !== '') {
                combined = combined.concat(topicsWithoutPicks)
                            .concat(picks)
                            .concat(this.state.countries.filter((topic) => {
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
            let countriesWithoutPicks = this.state.countries.filter((topic) => {
                return props.picks.indexOf(topic.id) < 0
            }),
                picks = this.state.countries.filter((topic) => {
                    return props.picks.indexOf(topic.id) >= 0
                }),
                combined = [].concat(picks).concat(countriesWithoutPicks);

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        let coords = {
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude
                        };

                        LocationService.locationId(coords.latitude, coords.longitude)
                            .then((locationId) => {
                                let currentCountries = this.state.countries.map((c) => {
                                        if (c.locationId === locationId) {
                                            c.recommended = true;
                                        }

                                        return c;
                                    }),
                                    currentTopics = this.state.topics.map((c) => {
                                        if (c.locationId === locationId) {
                                            c.recommended = true;
                                        }

                                        return c;
                                    });

                                this.setState(Object.assign({}, this.state, {topics: currentTopics, countries: currentCountries}));
                            })
                    }.bind(this));
            }

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
                picks={this.props.picks.filter((p) => countries.find((c) => c.id === p))}
                topics={recommendedFirst}
                enabled={this.props.enabled}
                search={{
                    placeholder: "Search for country",
                    onSearch: this.search.bind(this)
                }}
                onPick={this.props.onPick}
                onRemovePick={this.props.onRemovePick}
            />
        )
    }

    componentDidMount() {

    }
}

export default CountryCompetitionContainer