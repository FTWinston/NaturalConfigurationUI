import * as React from 'react';
import './App.css';
import { ConfigTextArea } from './ui';
import { useState, useMemo } from 'react';
import { IParserError, ConfigurationParser } from 'natural-configuration';

interface IString {
    value: string;
}

const parser = new ConfigurationParser<IString>([
    {
        type: 'standard',
        expressionText: 'Replace "(.*)" with "(.*)"',
        parseMatch: (match, action, error) => {
            if (match[1].length === 0) {
                error({
                    startIndex: 8,
                    length: 2,
                    message: 'Match text cannot be empty.'
                });
        
                return;
            }
        
            const before = new RegExp(match[1], 'g');
            const after = match[2];
        
            action(modify => modify.value = modify.value.replace(before, after));
        },
        examples: [
            'Replace "x" with "y"',
            'Replace "something" with ""'
        ]
    },
    {
        type: 'standard',
        expressionText: 'Convert to (.+) case',
        parseMatch: (match, action, error) => {
            if (match[1] === 'upper') {
                action(modify => modify.value = modify.value.toUpperCase());
            }
            else if (match[1] === 'lower') {
                action(modify => modify.value = modify.value.toLowerCase());
            }
            else {
                error({
                    startIndex: 11,
                    length: match[1].length,
                    message: `Unexpected case value: ${match[1]}`
                });
            }
        },
        examples: [
            'Convert to upper case',
            'Convert to lower case'
        ]
    }
]);

const App = () => {
    const [text, setText] = useState('');

    const [errors, setErrors] = useState([] as IParserError[]);

    const [highlightedError, setHighlightedError] = useState(undefined as IParserError | undefined);

    const errorDisplay = useMemo(() => errors.length === 0
        ? <div className="app__noList">No errors in configuration text.</div>
        : (
            <ol className="app__errorList">
                {errors.map((e, i) => {
                    const classes = e === highlightedError
                        ? 'app__error app__error--selected'
                        : 'app__error'
                    
                    const clicked = () => setHighlightedError(e === highlightedError ? undefined : e);

                    return <li key={i} className={classes} onClick={clicked}>{e.message} (position {e.startIndex}, length {e.length})</li>
                })}
            </ol>
        ),
        [errors]
    );

    return (
        <div className="app">
            <ConfigTextArea
                className="app__text"
                text={text}
                onChange={newText => {
                    setText(newText);
                    setErrors(parser.validate(newText));
                }}
                errors={errors}
                highlightedError={highlightedError}
                onEnterError={err => setHighlightedError(err)}
            />

            <div className="app__errors">
                <div className="app__sectionHeading">Errors (click to highlight)</div>
                {errorDisplay}
            </div>

            <div className="app__examples">
                <div className="app__sectionHeading">Example sentences (click to append)</div>
                <ul className="app__exampleList">
                    {parser.examples.map((ex, i) => (
                        <li
                            className="app__example"
                            key={i}
                            onClick={() => {
                                const newText = `${text} ${ex}.`;
                                setText(newText);
                                setErrors(parser.validate(newText));
                            }}
                        >
                            {ex}.
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
