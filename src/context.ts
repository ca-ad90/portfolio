import { createContext, Context } from "react";
const MouseContext: Context<{ x: number, y: number }> = createContext({
    x: 0,
    y: 0,
});

export { MouseContext };
