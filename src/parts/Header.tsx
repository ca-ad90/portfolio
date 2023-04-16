import {
    PointerEventHandler,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import "./header.css";
import { MouseContext } from "../context.ts";
import { gsap } from "gsap";
import { Type } from "typescript";
import { Link } from "react-router-dom";

function copy(obj: Array<Type> | Object) {
    return JSON.parse(JSON.stringify(obj));
}

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

function Header({ list }: { list: { path: string; name: string }[] }) {
    //CONTEXT
    const mouse = useContext(MouseContext);

    //REFS
    let content = useRef();
    let svg = useRef<SVGSVGElement | null>(null);
    let navbar = useRef<SVGPathElement | null>(null);

    let revertAnimation = useRef<gsap.core.Tween | null>(null);
    let openAnimation = useRef<gsap.core.Tween | null>(null);

    // STATES

    let [isDragging, setDragging] = useState<Boolean>(false);
    const [started, setStarted] = useState<Boolean>(false);
    const [m, setM] = useState<[number, number]>([0, 0]);
    const [l1, setl1] = useState<[number, number]>([window.innerWidth, 0]);
    const [l2, setl2] = useState<[number, number]>([0, 0]);
    const [q, setQ] = useState<[number, number, number, number]>([
        -window.innerWidth / 2,
        120,
        -window.innerWidth,
        0,
    ]);

    let [path, _setPath] = useState({
        M: [0, 0],
        l1: [window.innerWidth, 0],
        l2: [0, 0],
        q: [-window.innerWidth / 2, 120, -window.innerWidth, 0],
        z: "",
    });

    const [isOpen, setOpen] = useState(false);
    let [startPoint, setStartPoint] = useState({ x: 50, y: 50, qx: 0, qy: 0 });
    const [svgHeight, setSvgHeight] = useState("65px");

    //MEMO

    const pathStr2 = useMemo(() => {
        let pointm = "M" + m.join();
        let pointl1 = "l" + l1.join();
        let pointl2 = "l" + l2.join();
        let pointq = "q" + q.join();

        let currentPath = `${pointm} ${pointl1} ${pointl2} ${pointq}`;

        return currentPath;
    }, [m, l1, l2, q]);

    // PATH FUNCTIONS

    function setPath2({
        nM,
        nl1,
        nl2,
        nq,
    }: {
        nM?: [number, number];
        nl1?: [number, number] | number;
        nl2?: [number, number] | number;
        nq?: [number, number, number, number] | [number, number] | number;
    }) {
        if (nM) {
            setM(nM);
        }
        if (nl1) {
            let L1: [number, number] = typeof nl1 === "number" ? [nl1, 0] : nl1;
            setl1(L1);
        }
        if (nl2) {
            let L2: [number, number] = typeof nl2 === "number" ? [0, nl2] : nl2;
            setl2(L2);
        }
        if (nq) {
            let Q1: [number, number, number, number] =
                typeof nq === "number"
                    ? [q[0], nq, q[2], q[3]]
                    : nq.length === 2
                    ? [nq[0], nq[1], q[2], q[3]]
                    : nq;
            setQ(Q1);
        }

        let height = navbar.current
            ? (navbar.current.getBoundingClientRect().height + 10).toFixed(3) +
              "px"
            : "65px";
        setSvgHeight(height);
    }

    function onResize() {
        setPath2({
            nM: [0, 0],
            nl1: [window.innerWidth, 0],
            nl2: [0, 0],
            nq: [-window.innerWidth / 2, 120, -window.innerWidth, 0],
        });
    }

    //EFFECTS
    // - onLoaded
    useEffect(() => {
        onResize();
        setStarted(true);
        window.addEventListener("resize", onResize);
        //window.addEventListener("pointermove", pointerMove);
        window.addEventListener("pointerup", pointerUp);
        return () => {
            //window.removeEventListener("pointermove", pointerMove);
            window.removeEventListener("pointerup", pointerUp);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    // DRAGING
    useEffect(() => {
        if (isDragging) {
            let moveX = mouse.x - window.innerWidth;
            let moveY = startPoint.qy + (mouse.y - startPoint.y);

            /*             this.qh({
                hx: moveX,
                hy: moveY + 120,
            }); */

            setPath2({ nq: [moveX, moveY] });
        }
    }, [mouse, startPoint]);

    // - open / revert
    useEffect(() => {
        if (!started) return;
        if (!isDragging) {
            if (Math.abs(startPoint.qy - q[1]) > 120) {
                setOpen(!isOpen);
            } else {
                let from = JSON.parse(JSON.stringify(q));
                let to = [-window.innerWidth / 2, 120, -window.innerWidth, 0];
                revertAnimation.current = curveAnimation(from, to);
                revertAnimation.current.play();
            }
        }
    }, [isDragging]);

    // open/close effext
    useEffect(() => {
        if (!started) return;
        if (isOpen) {
            openAnimation.current = heightAnimation(0, 500);
            openAnimation.current.play().then(() => {
                let from = q;
                revertAnimation.current = curveAnimation(
                    from,
                    [-window.innerWidth / 2, 120, -window.innerWidth, 0],
                    "elastic.out(1.2, 0.15)",
                );
                revertAnimation.current.play();
            });
        } else {
            openAnimation.current = heightAnimation(l2[1], 0);
            openAnimation.current.play().then(() => {
                let from = JSON.parse(JSON.stringify(q));
                revertAnimation.current = curveAnimation(from, [
                    -window.innerWidth / 2,
                    120,
                    -window.innerWidth,
                    0,
                ]);
                revertAnimation.current.play();
            });
        }
    }, [isOpen]);

    //ANIMATIONS

    /*    function animateSvg(from: number[] | number, to: number[] | number) {
        let animation = gsap.fromTo(
            { nq: JSON.parse(JSON.stringify(q)) },
            {
                nq: from,
            },
            {
                nq: to,
                ease: "elastic.out(1.75, 0.1)",
                duration: 5,
                onUpdate: update,
                paused: true,
            },
        );

        function update(this: gsap.AnimationVars) {
            let obj = this.targets()[0];

            for (let k in obj) {
                if (typeof obj[k] === "string" && obj[k].indexOf(",") > 0) {
                    obj[k] = obj[k]
                        .split(",")
                        .map((e: string) => Number(Number(e).toFixed(3)));
                }
            }
            setPath2(obj);
        }
        return animation;
    }
    function openSvg(from: [number, number], to: [number, number]) {
        let animation = gsap.fromTo(
            JSON.parse(JSON.stringify(path)),
            {
                nl2: from,
            },
            {
                nl2: to,

                duration: 0.2,
                onUpdate: update,
                paused: true,
            },
        );
        function update(this: gsap.AnimationVars) {
            let obj = this.targets()[0];

            for (let k in obj) {
                if (typeof obj[k] === "string" && obj[k].indexOf(",") > 0) {
                    obj[k] = obj[k]
                        .split(",")
                        .map((e: string) => Number(Number(e).toFixed(3)));
                }
            }
            setPath2(obj);
        }
        return animation;
    } */

    function curveAnimation(
        from: number[],
        to: number[],
        ease: string = "elastic.out(1.2, 0.15)",
    ): gsap.core.Tween {
        from = from || [q[0], q[1]];
        let animation = gsap.fromTo(
            { nq: from },
            {
                nq: from,
            },
            {
                nq: to,
                ease: ease,
                duration: 3,
                onUpdate: animationUpdate,
                paused: true,
            },
        );

        return animation;
    }
    function heightAnimation(from: number, to: number): gsap.core.Tween {
        let animation = gsap.fromTo(
            { nq: q, nl2: l2 },
            {
                nl2: [0, from],
            },
            {
                nl2: [0, to],
                nq: [q[0], q[1] - to * 1.2],
                duration: 0.2,
                onUpdate: animationUpdate,
                paused: true,
            },
        );
        return animation;
    }

    function animationUpdate(this: gsap.AnimationVars) {
        let obj = this.targets()[0];

        for (let k in obj) {
            if (typeof obj[k] === "string" && obj[k].indexOf(",") > 0) {
                obj[k] = obj[k]
                    .split(",")
                    .map((e: string) => Number(Number(e).toFixed(3)));
            }
        }
        setPath2(obj);
    }

    //EVENT HANDLERS
    function pointerDown(el: any) {
        document.body.classList.add("no-select");
        if (true) {
            if (revertAnimation.current) {
                revertAnimation.current.kill();
            }

            //Start Dragging
            setDragging(true);

            //get mouse starting position
            setStartPoint({
                x: el.clientX,
                y: el.clientY,
                qx: path.q[0],
                qy: path.q[1],
            });
        }
    }

    function pointerUp() {
        document.body.classList.remove("no-select");
        setDragging(false);
    }
    return (
        <>
            <div className="navbar-wrapper top" style={{ height: svgHeight }}>
                <div>
                    {list.map((e) => {
                        return (
                            <Link to={e.path} key={e.name + "HEADER"}>
                                {e.name}
                            </Link>
                        );
                    })}
                </div>
                <svg
                    className="navbar-svg"
                    ref={svg}
                    style={{ height: svgHeight }}>
                    <linearGradient
                        id="grad1"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%">
                        <stop
                            offset="0%"
                            style={{
                                stopColor: "var(--magenta)",
                                stopOpacity: "1",
                            }}
                        />
                        <stop
                            offset="100%"
                            style={{
                                stopColor: "var(--purple)",
                                stopOpacity: "1",
                            }}
                        />
                    </linearGradient>
                    <path
                        ref={navbar}
                        onPointerDown={pointerDown}
                        className="test"
                        stroke="none"
                        fill="url(#grad1)"
                        d={pathStr2}
                    />
                </svg>
            </div>
        </>
    );
}

export default Header;
