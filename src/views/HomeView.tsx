import {
    useState,
    useRef,
    useContext,
    useEffect,
    MutableRefObject,
    forwardRef,
    createRef,
} from "react";
import { useScroll, useTransform } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
    Section,
    Sections,
    LandingSection,
    AboutSection,
    PortfolioSetion,
    GallerySection,
} from "../parts/Section";
import { motion, useMotionValueEvent } from "framer-motion";
import { SectionElement, setSectionProps } from "./utils";
import { DocContext } from "../docContext";
import styled, { StyledComponent } from "styled-components";

const ImgEl = styled.img`
    position: absolute;
    height: 150vh;
`;

export default function Home() {
    let imgRef = useRef<HTMLImageElement | null>(null);
    let imgoffset = useRef<number | null>(null);
    const scrollToSections = useRef<SectionElement[]>([]);

    let scrollSections: (
        SectionElements: MutableRefObject<SectionElement[]>,
    ) => void = useOutletContext();

    let dir = useRef<number>(1);

    function middle(el: HTMLElement | null, index: number) {
        if (!el) {
            console.log(el, "BAJS");
            return;
        }

        scrollToSections.current[index] = setSectionProps(el);
    }
    useEffect(() => {
        scrollSections(scrollToSections);
    }, [scrollSections, scrollToSections]);
    const { doc } = useContext(DocContext);
    const [transformY, setTransformY] = useState(0);
    const { scrollY } = useScroll({
        container: doc,
        target: scrollToSections.current[1],
    });
    useMotionValueEvent(scrollY, "change", (value) => {
        let top = imgRef.current?.getBoundingClientRect().top;
        let height = imgRef.current?.getBoundingClientRect().height;
        if (top && height)
            if (imgoffset.current === null) {
                imgoffset.current = -top;
            }
        let start = imgoffset.current;
        console.log(value);

        setTransformY(1 - value / window.innerHeight);
    });
    /* <div className="img-cont">
                    <motion.img
                        ref={imgRef}
                        alt=""
                        src="./img/faceSplatter.svg"
                        style={{
                            display: "block",
                            height: " 300%",
                            position: "relative",
                            maxHeight: " 129vh",
                            y: transformY * 100,
                            opacity: 1 - Math.abs(transformY),
                        }}
                    />
                </div>*/
    return (
        <motion.main
            style={{ top: "0px" }}
            initial={{ y: 0, x: -1000, opacity: 0 }}
            animate={{ y: 0, x: 0, opacity: 1 }}
            exit={{ y: 1000, x: 0, opacity: 0 }}
            transition={{ duration: 3 }}>
            <LandingSection
                data=""
                ref={(el) =>
                    (scrollToSections.current[0] = setSectionProps(el))
                }
            />

            <section
                id={"section-" + Sections[0].name}
                ref={(el) =>
                    (scrollToSections.current[1] = setSectionProps(el))
                }>
                <div className="section-wrapper about">
                    <h2 className="section-header">
                        {Sections[0].name.substring(0, 1).toUpperCase() +
                            Sections[0].name.substring(1)}{" "}
                    </h2>
                    <p className="section-pre" style={{ display: "none" }}>
                        {Sections[0].descr ? Sections[0].descr : ""}
                    </p>

                    <AboutSection data={Sections[0].props.data} />
                </div>
            </section>
            <section
                id={"section-" + Sections[1].name}
                ref={(el) =>
                    (scrollToSections.current[2] = setSectionProps(el))
                }>
                <div className="section-wrapper works">
                    <h2 className="section-header">
                        {Sections[1].name.substring(0, 1).toUpperCase() +
                            Sections[1].name.substring(1)}
                    </h2>

                    <PortfolioSetion data={Sections[1].props.data} />
                </div>
            </section>
            <section
                id={"section-" + Sections[2].name}
                ref={(el) =>
                    (scrollToSections.current[3] = setSectionProps(el))
                }>
                <h2 className="section-header">
                    {Sections[2].name.substring(0, 1).toUpperCase() +
                        Sections[2].name.substring(1)}
                </h2>
                <p className="section-pre">
                    {Sections[2].descr ? Sections[2].descr : ""}
                </p>
                <div className="section-wrapper">
                    <GallerySection data={Sections[2].props.data} />
                </div>
            </section>
        </motion.main>
    );
}
