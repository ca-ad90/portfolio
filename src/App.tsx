/* eslint-disable react-hooks/exhaustive-deps */
import Home from "./views/HomeView.tsx";
import Root from "./Root.tsx";
import PortfolioView from "./views/PortfolioView.tsx";
import "./App.css";
import { MutableRefObject } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
interface SectionElement extends HTMLElement {
    height: number;
    top: number;
    bottom: number;
    y: number;
    tag: number;
    overflow: number;
    offset: { top: number; bottom: number; gap: number };
    next: SectionElement;
    prev: SectionElement;
    current: SectionElement;
    index: number;
    align: string;
}

interface SectionRef<T> extends MutableRefObject<T> {
    height: number | undefined;
    top: number | undefined;
    bottom: number | undefined;
    y: number | undefined;
    tag: number | undefined;
    overflow: number | undefined;
    offset: { top: number; bottom: number; gap: number } | undefined;
    next: SectionElement | undefined;
    prev: SectionElement | undefined;
    index: number | undefined;
    align: string | undefined;
}

function App() {
    const router = createHashRouter([
        {
            children: [
                { element: <Home />, path: "/" },
                { element: <PortfolioView />, path: "/portfolio" },
            ],
            element: <Root />,
        },
    ]);

    return <RouterProvider router={router} />;
}

export default App;
