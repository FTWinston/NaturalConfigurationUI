import * as React from 'react';
import './App.css';
import { ConfigTextArea } from './ui';
import { useState } from 'react';

const errors = [
    {
        message: 'hello',
        startIndex: 6,
        length: 5,
    }
];

const App = () => {
    const [text, setText] = useState('');

    const [highlightedError, setSelectedError] = useState(undefined as number | undefined);

    return (
        <>
            <ConfigTextArea
                text={text}
                onChange={newText => setText(newText)}
                errors={errors}
                highlightedError={highlightedError}
                style={{height: '5em'}}
            />

            <ol className="app__errors">
                {errors.map((e, i) => {
                    const classes = i === highlightedError
                        ? 'app__error app__error--selected'
                        : 'app__error'
                    
                    const clicked = () => setSelectedError(i === highlightedError ? undefined : i);

                    return <li key={i} className={classes} onClick={clicked}>{e.message}</li>
                })}
            </ol>
        </>
    );
}

export default App;
