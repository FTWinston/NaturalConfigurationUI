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

    const [isIE, isIOS] = useMemo(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        const ie = !!ua.match(/msie|trident\/7|edge/);
        const ios = !!ua.match(/ipad|iphone|ipod/) && ua.indexOf('windows phone') === -1;
        return [ie, ios];
    }, []);

    // iOS adds 3px of (unremovable) padding to the sides of a textarea, so adjust highlights div to match
    const highlightStyle = useMemo(() => isIOS
        ? {
            paddingLeft: '+=3px',
            paddingRight: '+=3px',
        }
        : undefined,
        [isIOS]
    );

    const textWithMarks = useMemo(() => {
        let text = props.text;

        const sortedErrors = props.errors.sort((a, b) => a.startIndex < b.startIndex ? -1 : a.startIndex === b.startIndex ? 0 : 1);

        let offset = 0;
        for (const error of sortedErrors) {
            const startPos = error.startIndex + offset;
            const endPos = startPos + error.length;

            const openingTag = error === props.highlightedError
                ? '<mark class="natConfig__mark natConfig__mark--selected">'
                : '<mark class="natConfig__mark">'

            text = text.slice(0, startPos) + openingTag
                + text.slice(startPos, endPos) + '</mark>'
                + text.slice(endPos);

            offset += 13;
        }

        text = text.replace(/\n$/g, '\n\n');

        if (isIE) {
            // IE wraps whitespace differently in a div vs textarea, this fixes it
            text = text.replace(/ /g, ' <wbr>');
        }

        return text;
    }, [props.text, props.errors, props.highlightedError, isIE])

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
                    dangerouslySetInnerHTML={{__html: textWithMarks}}
                />
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