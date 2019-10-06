import React, { FunctionComponent, useRef, useMemo } from 'react';
import './ConfigTextArea.css';
import { IParserError } from 'natural-configuration';

interface Props {
    className?: string;
    style?: React.CSSProperties;
    text: string;
    onChange: (text: string, cursorPos: number) => void;
    errors: IParserError[];
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

    const onChange = props.onChange;

    const handleInput = useMemo(
        () => (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value, e.target.selectionStart),
        [onChange]
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

    const textWithMarks = useMemo(() => {
        let text = props.text;
        const errors = props.errors.sort((a, b) => a.startIndex < b.startIndex ? -1 : a.startIndex === b.startIndex ? 0 : 1);

        let offset = 0;
        for (const error of errors) {
            const startPos = error.startIndex + offset;
            const endPos = startPos + error.length;

            text = text.slice(0, startPos) + '<mark>'
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
    }, [props.text, props.errors, isIE])

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
                onScroll={handleScroll}
            />
        </div>
    )
}