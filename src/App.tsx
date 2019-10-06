import * as React from 'react';
import './App.css';
import { ConfigTextArea } from './ui';
import { useState } from 'react';
import { IParserError } from 'natural-configuration';

const errors = [
    {
        message: 'hello',
        startIndex: 6,
        length: 5,
    }
];

const App = () => {
    const [text, setText] = useState('');

    const [highlightedError, setSelectedError] = useState(undefined as IParserError | undefined);

    return (
        <>
            <ConfigTextArea
                text={text}
                onChange={newText => setText(newText)}
                errors={errors}
                highlightedError={highlightedError}
                onEnterError={err => setSelectedError(err)}
                style={{height: '5em'}}
            />

            <ol className="app__errors">
                {errors.map((e, i) => {
                    const classes = e === highlightedError
                        ? 'app__error app__error--selected'
                        : 'app__error'
                    
                    const clicked = () => setSelectedError(e === highlightedError ? undefined : e);

                    return <li key={i} className={classes} onClick={clicked}>{e.message}</li>
                })}
            </ol>
        </>
    );
}

export default App;
