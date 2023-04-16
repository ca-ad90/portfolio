import { createContext, MutableRefObject, useRef, createRef } from "react";

const [doc, setDoc] = [
    createRef<null>() as MutableRefObject<HTMLDivElement | null>,
    (value: HTMLDivElement | null): void => {},
];
const DocContext = createContext({ doc, setDoc });

const ScrollContext = createContext(0);

export { DocContext, ScrollContext };
