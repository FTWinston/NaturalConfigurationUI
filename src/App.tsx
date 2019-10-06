import * as React from 'react';
import './App.css';
import { ConfigTextArea } from './ui';

const errors = [
    {
        message: 'hello',
        startIndex: 6,
        length: 5,
    }
];

const App = () => {
    const [text, setText] = React.useState('');

    return (
        <ConfigTextArea
            text={text}
            onChange={newText => setText(newText)}
            errors={errors}
            style={{height: '5em'}}
        />
    );
}

export default App;
