import * as React from 'react';
import './App.css';
import { ConfigTextArea } from './ui';
import { useState } from 'react';
import { IParserError, ConfigurationParser } from 'natural-configuration';

interface IString {
    value: string;
}

const parser = new ConfigurationParser<IString>([
    {
        type: 'standard',
        expressionText: 'Replace \"(.*)\" with \"(.*)\"',
        parseMatch: (modify, match) => {
            if (match[1].length === 0) {
                return [{
                    startIndex: 8,
                    length: 2,
                    message: 'Match text cannot be empty.'
                }];
            }
        
            const before = new RegExp(match[1], 'g');
            const after = match[2];
        
            modify.value = modify.value.replace(before, after);
            return [];
        },
        examples: [
            'Replace "x" with "y"',
            'Replace "something" with ""'
        ]
    },
    {
        type: 'standard',
        expressionText: 'Convert to (.+) case',
        parseMatch: (modify, match) => {
            if (match[1] === 'upper') {
                modify.value = modify.value.toUpperCase();
            }
            else if (match[1] === 'lower') {
                modify.value = modify.value.toLowerCase();
            }
            else {
                return [{
                    startIndex: 11,
                    length: match[1].length,
                    message: `Unexpected case value: ${match[1]}`
                }];
            }
    
            return [];
        },
        examples: [
            'Convert to upper case',
            'Conver to lower case'
        ]
    }
]);

const App = () => {
    const [text, setText] = useState('');

    const [errors, setErrors] = useState([] as IParserError[]);

    const [highlightedError, setSelectedError] = useState(undefined as IParserError | undefined);

    return (
        <>
            <ConfigTextArea
                text={text}
                onChange={newText => {
                    setText(newText);
                    setErrors(parser.parse({value: 'Test value to modify'}, newText));
                }}
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
