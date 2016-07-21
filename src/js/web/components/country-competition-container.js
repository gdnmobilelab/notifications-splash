import React from 'react';
import ToggleContainer from './toggle-container';
import runServiceWorkerCommand from 'service-worker-command-bridge/client';
import SubscriptionService from '../services/SubscriptionService';

class CountryCompetitionContainer extends React.Component {

    constructor(props) {
        super();
        this.state = {
            picks: [],
            enabled: false,
            countries: props.countries
        };
    }

    search(e) {
        var re;
        this.setState({countries: this.props.countries.filter((country) => {
            re = new RegExp(e.target.value,"gi");
            return country.name.search(re) !== -1 || country.id.search(re) !== -1
        })});
    }

    pick(country) {
        if (this.state.picks.find((pick) => pick.id === country.id)) {
            this.setState({picks: this.state.picks.filter((pick) => pick.id !== country.id)});
            SubscriptionService.unsubscribe(country.id)
                .then((success) => {
                }).catch((error) => {
                console.error(error);
                //Implement error handling here.
            })
        } else {
            this.setState({picks: this.state.picks.concat([country])})
            SubscriptionService.subscribe(country.id)
                .then((success) => {

                }).catch((error) => {
                console.error(error);
                //Implement error handling here.
            });
        }
    }

    render() {
        return (
            <div>
                <input type="text" className="search" placeholder="Search for country" onChange={this.search.bind(this)} />
                <ToggleContainer
                    enabled={this.state.enabled}
                    buttons={this.state.countries}
                    selected={this.state.picks}
                    disabled={this.state.disabled}
                    onClick={this.pick.bind(this)} />
            </div>
        )
    }

    componentDidMount() {
        return runServiceWorkerCommand('pushy.getSubscribedTopics')
            .then((topics) => {
                let picks = this.props.countries.filter((country) => topics.indexOf(country.id) !== -1);
                let countries = this.props.countries.filter((country) => !(picks.find((s) => s.id == country.id)));

                picks.forEach((selected) => {
                    countries.unshift(selected);
                });

                this.setState({
                    enabled: true,
                    picks: picks,
                    countries: countries
                });
            })
            .then(() => {
                runServiceWorkerCommand("analytics", {
                    t: 'pageview',
                    dh: window.location.hostname,
                    dp: window.location.pathname,
                    dt: 'Sign up page'
                })
            })
            .catch((err) => {
                console.error(err)
            })
    }
}

export default CountryCompetitionContainer