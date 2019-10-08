import React, { FunctionComponent, useRef, useMemo } from 'react';
import './ConfigTextArea.css';
import { IParserError } from 'natural-configuration';

interface Props {
    className?: string;
    style?: React.CSSProperties;
    text: string;
    onChange: (text: string) => void;
    onEnterError?: (error: IParserError | undefined) => void;
    errors: IParserError[];
    highlightedError?: IParserError;
}

export const ConfigTextArea: FunctionComponent<Props> = props => {
    const backdrop = useRef<HTMLDivElement>(null);

    // iOS adds 3px of (unremovable) padding to the sides of a textarea, so adjust highlights div to match
    const highlightStyle = useMemo(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        const ios = !!ua.match(/ipad|iphone|ipod/) && ua.indexOf('windows phone') === -1;
        
        return ios
            ? {
                paddingLeft: '+=3px',
                paddingRight: '+=3px',
            }
            : undefined;
    }, []);

    const modifyText = useMemo(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        const ie = !!ua.match(/msie|trident\/7|edge/);

        // IE wraps whitespace differently in a div vs textarea, this should correct that
        if (ie) {
            return (text: string) => text
                .replace(/\n$/g, '\n\n')
                .replace(/ /g, ' <wbr>')
        }

        return (text: string) => text
                .replace(/\n$/g, '\n\n');
    }, []);

    const textWithMarks = useMemo(() => {
        const elements: Array<JSX.Element | string> = [];
        let nextKey = 0;
        let readPos = 0;

        const sortedErrors = props.errors.sort((a, b) => a.startIndex < b.startIndex ? -1 : a.startIndex === b.startIndex ? 0 : 1);

        const text = props.text;

        for (const error of sortedErrors) {
            if (error.startIndex < readPos) {
                continue; // where errors overlap, only the first of each overlapping set will show
            }

            const precedingText = modifyText(text.substring(readPos, error.startIndex));

            const markedText = modifyText(text.substr(error.startIndex, error.length));

            const classes = error === props.highlightedError
                ? 'natConfig__mark natConfig__mark--selected'
                : 'natConfig__mark';

            elements.push(precedingText);

            elements.push(<mark className={classes} key={nextKey++}>{markedText}</mark>)

            readPos = error.startIndex + error.length;
        }

        return elements;
    }, [props.text, props.errors, props.highlightedError, modifyText])

    const { onChange, onEnterError, errors } = props;

    const handleInput = useMemo(
        () => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e.target.value);

            if (onEnterError !== undefined) {
                const error = findError(errors, e.currentTarget.selectionStart, e.currentTarget.selectionEnd);
                onEnterError(error);
            }
        },
        [onChange, onEnterError, errors]
    );

    const handleSelect = useMemo(
        () => onEnterError === undefined
            ? undefined
            : (e: React.SyntheticEvent<HTMLTextAreaElement, Event>) => {
                const error = findError(errors, e.currentTarget.selectionStart, e.currentTarget.selectionEnd);
                onEnterError(error);
            },
        [onEnterError, errors]
    );

    const handleScroll = useMemo(
        () => (e: React.UIEvent<HTMLTextAreaElement>) => {
            if (backdrop.current === null) {
                return;
            }
            backdrop.current.scrollLeft = e.currentTarget.scrollLeft;
            backdrop.current.scrollTop = e.currentTarget.scrollTop;
        },
        [backdrop]
    );

    const classes = props.className === undefined
        ? 'natConfig'
        : 'natConfig ' + props.className;

    return (
        <div className={classes} style={props.style}>
            <div className="natConfig__backdrop" ref={backdrop}>
                <div
                    className="natConfig__highlights"
                    style={highlightStyle}
                >
                    {textWithMarks}
                </div>
            </div>
            <textarea
                className="natConfig__text"
                value={props.text}
                onChange={handleInput}
                onSelect={handleSelect}
                onScroll={handleScroll}
            />
        </div>
    )
}

function findError(errors: IParserError[], startPos: number, endPos: number) {
    if (endPos < startPos) {
        [startPos, endPos] = [endPos, startPos];
    }

    const error = errors.find(err => err.startIndex <= startPos && err.startIndex + err.length > startPos);
    
    if (error === undefined) {
        return undefined;
    }

    if (error.startIndex + error.length < endPos) {
        return undefined;
    }

    return error;
}