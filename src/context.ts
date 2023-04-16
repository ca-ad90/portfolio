import {
    createContext,
    Context,
    useRef,
    MutableRefObject,
    RefObject,
    createRef,
} from "react";
const MouseContext: Context<{ x: number; y: number }> = createContext({
    x: 0,
    y: 0,
});
let div = document.createElement("div");
const DocContext: Context<{
    doc: MutableRefObject<HTMLDivElement | null>;
    setDoc: () => void;
}> = createContext({
    doc: createRef() as MutableRefObject<HTMLDivElement | null>,
    setDoc: () => {},
});

export { MouseContext, DocContext, createContext };
