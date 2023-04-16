import { motion, useScroll, useTransform } from "framer-motion";
import { ForwardedRef, ReactNode, forwardRef, useRef } from "react";

interface ScrollInProps {
    children: ReactNode;
    totalCount: number;
    index: number;
    className: string;
}
function ScrollIn(props: ScrollInProps, ref: ForwardedRef<HTMLDivElement>) {
    let motionRef = useRef(null);
    ref = motionRef;
    const { scrollYProgress } = useScroll({
        container: useRef(document.querySelector("#parallax-wrapper")),
        target: motionRef,
        offset: ["start end", "center start"],
    });

    let timeLine = [0, 0.2, 0.9, 1];
    let timeLine2 = [0, 0.25, 0.75, 1];

    const screenWidth = window.innerWidth * 0.08;

    const opacity = useTransform(scrollYProgress, timeLine, [0, 1, 1, 0]);

    const scale = useTransform(scrollYProgress, timeLine, [1, 1, 1, 1]);
    const translateY = useTransform(scrollYProgress, timeLine2, [
        (-window.innerHeight / 2) * 0.25,
        1,
        1,
        (window.innerHeight / 2) * 0.25,
    ]);

    let x = props.totalCount;
    let n = -((x - 1) / 2 - props.index) / ((x - 1) / 2);
    const left = useTransform(scrollYProgress, timeLine, [
        (n * screenWidth) / 5,
        0,
        0,
        (n * screenWidth) / 5,
    ]);

    return (
        <motion.div
            ref={motionRef}
            className={props.className}
            style={{ opacity, left, scale, translateY }}>
            {props.children}
        </motion.div>
    );
}
export { ScrollIn };
