import { AnimatePresence, motion } from "framer-motion";
import {
    useState,
    useRef,
    useEffect,
    MutableRefObject,
    ReactNode,
} from "react";
import PortfolioRow from "../parts/PortfolioPart";
import { SectionElement, setSectionProps } from "./utils";
import { useOutletContext } from "react-router-dom";

import "./PortfolioView.scss";

interface PortfolioContentProps {
    list: {
        content: ReactNode;
        text: string;
        name: string;
        src: string;
        navContent: ReactNode;
    }[];
}
export default function Portfolio({ list }: PortfolioContentProps) {
    const cont = useRef<HTMLDivElement | null>(null);
    const scrollToSections = useRef<SectionElement[]>([]);

    let scrollSections: (
        SectionElements: MutableRefObject<SectionElement[]>,
    ) => void = useOutletContext();

    useEffect(() => {
        scrollSections(scrollToSections);
    }, [scrollToSections]);

    const [currentWork, setCurrentWork] = useState(0);

    function setWork(newWork: number) {
        let n = currentWork == newWork ? currentWork : newWork;
        setCurrentWork(n);
    }

    return (
        <motion.div
            id="portfolio-view"
            initial={{ y: 0, x: 1000, opacity: 0 }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{ y: 1000, x: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={(el) => (scrollToSections.current[0] = setSectionProps(el))}>
            <div className="portfolio-nav">
                <AnimatePresence>
                    {list.map((e, i) => {
                        return (
                            <>
                                {i + 1 === currentWork && (
                                    <motion.div
                                        key={i}
                                        style={{
                                            top: "0px",
                                            left: "0px",
                                            height: "100%",
                                        }}
                                        initial={{ y: 0, x: 1000, opacity: 1 }}
                                        animate={{ y: 0, x: 0, opacity: 1 }}
                                        exit={{ y: 0, x: -1100, opacity: 0.5 }}
                                        transition={{ duration: 0.5 }}>
                                        <motion.div
                                            className="portfolio-content"
                                            key={i + "asdfawf"}
                                            style={{
                                                top: "0px",
                                                left: "0px",
                                                height: "100%",
                                            }}
                                            initial={{
                                                y: 0,
                                                x: 1000,
                                                opacity: 1,
                                            }}
                                            animate={{ y: 0, x: 0, opacity: 1 }}
                                            exit={{
                                                y: 0,
                                                x: -1100,
                                                opacity: 0.5,
                                            }}
                                            transition={{ duration: 0.5 }}>
                                            {e.content}
                                        </motion.div>
                                    </motion.div>
                                )}{" "}
                            </>
                        );
                    })}
                </AnimatePresence>
            </div>
            <div className="preview scroller" ref={cont}>
                {list.map((e, i) => {
                    return (
                        <PortfolioRow
                            trigger={setWork}
                            onClick={setWork}
                            motionContainer={cont}
                            title={e.name}
                            key={e.name + i}
                            index={i}>
                            {e.navContent}
                        </PortfolioRow>
                    );
                })}
            </div>
        </motion.div>
    );
}
