import React from 'react';

export default class ToggleContainer extends React.Component {

    constructor() {
        super();
    }

    onClick(button, e) {
        this.props.onClick(button);
    }

    render() {
        let buttons = this.props.buttons.map((button) => {
            let isPicked = this.props.selected.find((s) => s.id == button.id) ? true : false;
            let buttonClass = 'cmn-toggle cmn-toggle-round';
            let inputClass = '';
            let isDisabled = false;
            let buttonId = `cmn-toggle-${button.id}`;

            if (this.props.selected.length >= 3 && !isPicked) {
                inputClass += ' disabled';
                isDisabled = true;
            }

            if (!this.props.enabled) {
                isDisabled = true;
                inputClass += ' disabled';
            }

            return (
                <div key={button.id} className="toggle-container">
                    <div className="toggle-text">
                        {button.name}
                    </div>
                    <div className="toggle">
                        <input checked={isPicked} disabled={isDisabled} id={buttonId} className={buttonClass} type="checkbox" onClick={this.props.onClick.bind(this, button)} />
                        <label htmlFor={buttonId} className={inputClass}></label>
                    </div>
                </div>

            );
        }, this);

        return (
            <div>
                {buttons}
            </div>
        )
    }
};