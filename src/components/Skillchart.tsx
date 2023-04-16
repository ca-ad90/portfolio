import styled from "styled-components";
import { useRef, useMemo, useEffect, useState } from "react";
import { motion, motionValue, useAnimate, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { curve } from "../views/utils";
import { useIsPresent } from "framer-motion";

const Outer = styled.div`
    position:relative;
    width:9vmin;
    height:9vmin;
    max-width:110px;
    max-height:110px;
    min-width:90px;
    min-height:90px;
    display: flex;
    align-items:center;
    justify-content:center;
    border-radius:100vw;
    border-radius:100vw;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 99;

  }
`;

const Inner = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: conic-gradient(yellow, orange, magenta, purple);
`;

export default function SkillChart({
    lvl,
    text,
    src,
}: {
    src: string;
    lvl: number;
    text: string;
}) {
    const outerDiv = useRef<HTMLDivElement | null>(null);
    const isPresent = useIsPresent();

    const innerDiv = useRef<HTMLDivElement | null>(null);
    const frame = useRef<number>(0);
    const resolveAnimation = useRef<((reason?: any) => void) | null>(null);
    const [getLvl, setLvl] = useState(0);
    const [screen, setScreen] = useState<{ h: number; w: number }>({
        h: window.innerHeight,
        w: window.innerWidth,
    });
    function resize() {
        setScreen({ h: window.innerHeight, w: window.innerWidth });
        console.log(screen);
    }
    useEffect(() => {
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    });
    useEffect(() => {
        if (outerDiv.current == null || innerDiv.current == null) return;
        let vmin =
            (window.innerHeight < window.innerWidth
                ? window.innerHeight
                : window.innerWidth) * 0.09;
        let size = vmin > 150 ? 150 : vmin < 90 ? 90 : vmin;
        const cx = size / 2;
        const cy = size / 2;

        const outerRadius = cx;
        const innerRadius = size / 2.6;

        let deg = getLvl * (360 / 90);
        let lf = deg > 2 ? 1 : 0;

        let L = deg == 4 ? "" : ` L${cx} ${cy}`;
        let rad = deg == 4 ? 3.9999 : deg;

        let x1 = Number(
            (Math.cos(((0 - 1) * Math.PI) / 2) * outerRadius + cx).toFixed(4),
        );

        let y1 = Number(
            (Math.sin(((0 - 1) * Math.PI) / 2) * outerRadius + cy).toFixed(4),
        );

        let x2 = Number(
            (Math.cos(((rad - 1) * Math.PI) / 2) * outerRadius + cx).toFixed(4),
        );
        let y2 = Number(
            (Math.sin(((rad - 1) * Math.PI) / 2) * outerRadius + cy).toFixed(4),
        );

        let x3 = Number(
            (Math.cos(((0 - 1) * Math.PI) / 2) * innerRadius + cx).toFixed(4),
        );
        let y3 = Number(
            (Math.sin(((0 - 1) * Math.PI) / 2) * innerRadius + cy).toFixed(4),
        );

        let x4 = Number(
            (Math.cos(((rad - 1) * Math.PI) / 2) * innerRadius + cx).toFixed(4),
        );
        let y4 = Number(
            (Math.sin(((rad - 1) * Math.PI) / 2) * innerRadius + cy).toFixed(4),
        );

        let str = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${lf} 1 ${x2} ${y2} ${L}`;
        let str2 = `M ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${lf} 0 ${x3} ${y3} ${L}`;

        if (innerDiv.current == null) return;
        innerDiv.current.style.clipPath = `path("${str + " " + str2}")`;
    }, [screen, innerDiv, outerDiv, lvl, getLvl]);

    async function animate(to: number, duration: number) {
        if (resolveAnimation.current != null) {
            resolveAnimation.current("");
        }
        const startTime = new Date().getTime();
        const startLvl = getLvl;
        return new Promise((res, rej) => {
            resolveAnimation.current = rej;
            function loop() {
                let time = new Date().getTime();
                let elapsed = time - startTime;
                let x = Math.min(1, elapsed / duration);
                let len = to - startLvl;
                let currentLvL = startLvl + curve(x) * len;
                setLvl(currentLvL);
                if (x == 1) {
                    res("");
                } else {
                    frame.current = requestAnimationFrame(loop);
                }
            }
            frame.current = requestAnimationFrame(loop);
        });
    }

    let delay = Number(Math.floor(Math.random() * 4).toFixed(2)) / 5;
    console.log(delay);

    useEffect(() => {
        if (isPresent) {
            setTimeout(() => {
                animate(lvl, 500).then(() => {
                    console.log("bajs");
                });
            }, delay * 1000);
        }
    }, [isPresent]);

    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.2,
            }}
            transition={{
                duration: 0.7,
                delay: delay,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
                width: "fit-content",
                height: "fit-content",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 1,
            }}>
            <Outer ref={outerDiv}>
                <div
                    className="skillLables"
                    data-name={text}
                    style={{
                        width: "67%",
                        height: "67%",
                        backgroundImage: src ? "url(" + src + ")" : "",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "100vmax",
                        backgroundColor: "var(--light-magenta)",
                        backgroundSize: "101%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}>
                    {!src && text}
                </div>
                <Inner ref={innerDiv}></Inner>
            </Outer>
        </motion.div>
    );
}
