import React from 'react';

export default class ToggleComponent extends React.Component {

    constructor() {
        super();
    }

    onClick(button, e) {
        this.props.onClick(button);
    }

    render() {
        let buttons = this.props.buttons.map((button) => {
            let isPicked = this.props.selected.find((s) => s == button.id) ? true : false;
            let recommended = !!button.recommended;
            let buttonClass = 'cmn-toggle cmn-toggle-round';
            let toggleTextClass = 'toggle-text';
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

            var toggleText = <div className={toggleTextClass}>
                {button.name}
            </div>;
            if (recommended) {
                toggleTextClass += ' recommended';
                toggleText = <div className={toggleTextClass}>
                                {button.name}
                                <br />
                                <span className="your-location">(Your location)</span>
                             </div>;
            }

            return (
                <div key={button.id} className="toggle-container">
                    {toggleText}
                    <div className="toggle">
                        <div className="toggle-floater">
                            <input checked={isPicked} disabled={isDisabled} id={buttonId} className={buttonClass} type="checkbox" onChange={this.props.onClick.bind(this, button)} />
                            <label htmlFor={buttonId} className={inputClass}></label>
                        </div>
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