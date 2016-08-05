import React from 'react';
import ToggleComponent from './toggle-component';
import SubscriptionService from '../services/SubscriptionService';

class TopicComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    pick(topic) {
        if (this.props.picks.find((pick) => pick === topic.id)) {
            this.props.onRemovePick(topic.id);
            SubscriptionService.unsubscribe(topic.id)
                .catch((error) => {
                    this.props.onPick(topic.id);
                    console.error(error);
                })
        } else {
            this.props.onPick(topic.id);
            SubscriptionService.subscribe(topic.id)
                .catch((error) => {
                    console.error(error);
                    this.props.onRemovePick(topic.id);
                    //Implement error handling here.
                 });
        }
    }

    blurSearch(e) {
        if(e.which == 13) {
            e.target.blur();
            return false; // returning false will prevent the event from bubbling up.
        }
    }

    render() {
        var searchBar = '',
            description = '';

        if (this.props.search) {
            searchBar =
                <div className="toggle-container">
                    <input type="search" onKeyPress={this.blurSearch.bind(this)} className="search" placeholder={this.props.search.placeholder} onChange={this.props.search.onSearch.bind(this)} />
                </div>
        }

        if (this.props.description) {
            description = <p>{this.props.description}</p>
        }

        return (
            <div>
                {description}
                {searchBar}
                <ToggleComponent
                    enabled={this.props.enabled}
                    buttons={this.props.topics}
                    selected={this.props.picks}
                    onClick={this.pick.bind(this)} />
            </div>
        )
    }
}

export default TopicComponent