import React from 'react';

export default class Toggle extends React.Component {
    constructor() {
        super();
    }
    
    render() {
        let containerClass = "toggle-container";
        let clickAction = this.props.onClick;
        
        if (this.props.disabled === true) {
            containerClass += " disabled";
            clickAction = null;
        } else if (this.props.value === true) {
            containerClass += " active";
        }
        
        if (this.props.animate === true) {
            containerClass += " animate";
        }
        return <div className={containerClass} onClick={clickAction}>
           
            <div className='toggle'>
                <div className='toggle-button'></div>
            </div>
            <p>{this.props.text}</p>
        </div>
    }
}