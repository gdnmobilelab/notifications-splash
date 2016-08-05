import React from 'react';
import ToggleComponent from './toggle-component';
import SubscriptionService from '../services/SubscriptionService';

class TopicComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="loading">
                <ul className="projects projects--1">
                    <svg className="projects__logo" viewBox="0 0 36 36">
                        <ellipse fill="#fff" cx="18" cy="18" rx="18" ry="17.9"></ellipse>
                        <path fill="#005689" d="M21.3 8.1c0-4.9-1.5-5.7-3.3-5.7s-3.2.7-3.2 5.7 1.5 5.5 3.2 5.5c1.8-.1 3.3-.6 3.3-5.5m-6.5 18.8c-2.3 0-2.9 1.7-2.9 2.9 0 1.8 1.6 3.4 6.3 3.4 5.3 0 6.8-1.5 6.8-3.4 0-1.7-1.3-2.9-3.4-2.9h-6.8zM10.5 1.7C4.3 4.5 0 10.7 0 18c0 4.9 2 9.4 5.2 12.6v-.3c0-3.2 3.1-4.4 5.9-5-2.6-.6-3.9-2.5-3.9-4.4 0-2.6 2.9-4.8 4.3-5.8l-.1-.1c-2.5-1.4-4.1-3.8-4.1-7-.1-2.7 1.2-4.9 3.2-6.3M36 18.1c0-7.4-4.5-13.8-10.9-16.5 2.1 1.4 3.4 3.5 3.5 6.3l.1.6c0 5.4-4.4 8.2-10.7 8.2-1.6 0-2.7-.1-4.1-.5-.6.4-1.1 1.1-1.1 1.8 0 .9.8 1.6 1.8 1.6h8.8c5.5 0 8.2 2.2 8.2 7.1 0 1.6-.3 3.1-1 4.3 3.3-3.4 5.4-7.9 5.4-12.9"></path>
                    </svg>
                    <li className="projects__atom projects__atom--1">
                        <div className="projects__atom-button button" href="https://www.gdnmobilelab.com/apps/io/" style={{backgroundColor: '#197dab'}}>
                            <img className="projects__atom-icon button__icon" src="/assets/icons/notification.svg" />
                        </div>
                        <svg className="projects__atom-trail" viewBox="0 0 100 100">
                            <defs>
                                <clipPath id="projects__atom-mask--1">
                                    <rect className="projects__atom-mask" y="50" width="100" height="50"></rect>
                                </clipPath>
                            </defs>
                            <circle clipPath="url(#projects__atom-mask--1)" strokeWidth="6" strokeDasharray=".1,3" strokeLinecap="round" stroke="#197dab" fill="none" cx="50" cy="50" r="45"></circle>
                        </svg>
                    </li>
                </ul>
            </div>
        )
    }
}

export default TopicComponent