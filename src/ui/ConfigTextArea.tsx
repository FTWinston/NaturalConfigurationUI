import React, { FunctionComponent } from 'react';
import './ConfigTextArea.css';

interface Props {
    className?: string;
    text: string;
}

export const ConfigTextArea: FunctionComponent<Props> = props => {
    const classes = props.className === undefined
        ? 'natConfig'
        : 'natConfig ' + props.className;

    return (
        <div className={classes}>{props.text}</div>
    )
}
