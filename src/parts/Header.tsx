import {
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import "./header.css";
import { MouseContext } from "../context.js";
import { gsap } from "gsap";

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const Header = forwardRef(function Header(props, wrapper: any) {
    const mouse = useContext(MouseContext);
    let content = useRef();
    let svg = useRef();
    let navbar = useRef<SVGPathElement>();
    let [isDragging, setDragging] = useState(false);
    const [started, setStarted] = useState(false);
    const bar = useCallback(() => {
        return navbar.current
            ? {
                  height: navbar.current.getBoundingClientRect().height,
                  width: navbar.current.getBoundingClientRect().width,
              }
            : { height: 0, width: 0 };
    }, [navbar]);

    const [m, setM] = useState([0, 0]);
    const [l1, setl1] = useState([window.innerWidth, 0]);
    const [l2, setl2] = useState([0, 0]);
    const [q, setQ] = useState([
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

    const pathStr2 = useMemo(() => {
        let pointm = "M" + m.join();
        let pointl1 = "l" + l1.join();
        let pointl2 = "l" + l2.join();
        let pointq = "q" + q.join();

        let currentPath = `${pointm} ${pointl1} ${pointl2} ${pointq}`;

        return currentPath;
    }, [m, l1, l2, q]);

    const [isOpen, setOpen] = useState(false);
    let revertAnimation = useRef(null);
    let openAnimation = useRef(null);
    let [startPoint, setStartPoint] = useState({ x: 50, y: 50, qx: 0, qy: 0 });

    function setPath(
        {
            M,
            l1,
            l2,
            q,
        }: {
            M?: number[];
            l1?: number[];
            l2?: number[];
            q?: number[];
        },
        from?,
    ) {
        let tmp: {
            M?: number[];
            l1?: number[];
            l2?: number[];
            q?: number[];
            z: string;
        } = JSON.parse(JSON.stringify(path));

        for (let key in arguments[0]) {
            if (key.indexOf("_") != -1) {
                continue;
            }
            let arg;
            let k;

            try {
                arg = arguments[0][key];
                if (arg) {
                    arg.forEach((e, i) => {
                        tmp[key][i] = e;
                    });
                }
            } catch (error) {
                console.log("\nerror", arg, key);
            }
        }

        _setPath({
            M: tmp.M,
            l1: tmp.l1,
            l2: tmp.l2,
            q: tmp.q,
            z: tmp.z,
        });
        let height =
            (navbar.current.getBoundingClientRect().height + 10).toFixed(3) +
            "px";
        setSvgHeight(height);
    }

    function setPath2({
        M,
        l1,
        l2,
        q,
    }: {
        M?: any;
        l1?: any;
        l2?: any;
        q?: any;
    }) {
        if (M) {
            setM([M]);
        }
        if (l1) {
            setl1(l1);
        }
        if (l2) {
            setl2(l2);
        }
        if (q) {
            let w = q[2] ? q[2] : -window.innerWidth;
            let h = q[3] ? q[3] : 0;
            setQ([q[0], q[1], w, h]);
        }

        let height =
            (navbar.current.getBoundingClientRect().height + 10).toFixed(3) +
            "px";
        setSvgHeight(height);
    }

    const pathStr = useMemo(() => {
        let currentPath = Object.entries(path)
            .map((e) => {
                e[0] = e[0].replace(/\d/, "");
                return e;
            })
            .flat(99); // [["M",[0,0]],["l1",[100,0]]...]
        return currentPath;
    }, [path]);

    const [svgHeight, setSvgHeight] = useState("65px");

    const list = [
        { name: "Home", href: "/home" },
        { name: "About", href: "/about" },
        { name: "Portfolio", href: "/portfolio" },
        { name: "Gallery", href: "/gallery" },
        { name: "Contact", href: "/contact" },
    ];

    function onResize() {
        setPath2({
            M: [0, 0],
            l1: [window.innerWidth, 0],
            l2: [0, 0],
            q: [-window.innerWidth / 2, 120, -window.innerWidth, 0],
        });
    }
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

    function pointerDown(el) {
        document.body.classList.add("no-select");
        if (el.target == wrapper.current || true) {
            if (revertAnimation.current) {
                console.log(revertAnimation.current);
                revertAnimation.current.kill();
            }
            const event = el.touches ? el.touches[0] : el;

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
    useEffect(() => {
        if (isDragging) {
            console.log(isDragging);
            let moveX = mouse.x - window.innerWidth;
            let moveY = startPoint.qy + (mouse.y - startPoint.y);

            /*             this.qh({
                hx: moveX,
                hy: moveY + 120,
            }); */

            setPath2({ q: [moveX, moveY] });
        }
    }, [mouse, startPoint]);

    useEffect(() => {
        if (!started) return;
        if (!isDragging) {
            if (Math.abs(startPoint.qy - q[1]) > 120) {
                setOpen(!isOpen);
            } else {
                console.log("revert");
                let from = JSON.parse(JSON.stringify(q));
                let to = [-window.innerWidth / 2, 120, -window.innerWidth, 0];
                revertAnimation.current = animateSvg(from, to);
                revertAnimation.current.play();
            }
        }
    }, [isDragging]);

    useEffect(() => {
        if (!started) return;
        if (isOpen) {
            openAnimation.current = openSvg(l2, [0, 500]);
            openAnimation.current.play().then(() => {
                let from = q;
                from[1] = from[1] - 100;
                revertAnimation.current = animateSvg(from, [
                    -window.innerWidth / 2,
                    120,
                    -window.innerWidth,
                    0,
                ]);
                revertAnimation.current.play();
            });
        } else {
            openAnimation.current = openSvg(
                JSON.parse(JSON.stringify(l2)),
                [0, 0],
            );
            openAnimation.current.play().then(() => {
                let from = JSON.parse(JSON.stringify(q));
                from[1] = from[1];
                revertAnimation.current = animateSvg(from, [
                    -window.innerWidth / 2,
                    120,
                    -window.innerWidth,
                    0,
                ]);
                revertAnimation.current.play();
            });
        }
    }, [isOpen]);

    /*     function pointerMove(ev) {
        setCurrentMouse({
            x: ev.clientX,
            y: ev.clientY,
        });
    } */
    function pointerUp(el) {
        document.body.classList.remove("no-select");
        setDragging(false);
    }

    function animateSvg(from, to) {
        console.log("revert", from, to);
        let animation = gsap.fromTo(
            { q: JSON.parse(JSON.stringify(q)) },
            {
                q: from,
            },
            {
                q: to,
                ease: "elastic.out(1.75, 0.1)",
                duration: 5,
                onUpdate: update,
                paused: true,
            },
        );

        function update() {
            let obj = this.targets()[0];

            for (let k in obj) {
                if (typeof obj[k] == "string" && obj[k].indexOf(",") > 0) {
                    obj[k] = obj[k]
                        .split(",")
                        .map((e) => Number(Number(e).toFixed(3)));
                }
            }
            setPath2(obj);
        }
        return animation;
    }
    function openSvg(from, to) {
        let animation = gsap.fromTo(
            JSON.parse(JSON.stringify(path)),
            {
                l2: from,
            },
            {
                l2: to,

                duration: 0.2,
                onUpdate: update,
                paused: true,
            },
        );
        function update() {
            let obj = this.targets()[0];

            for (let k in obj) {
                if (typeof obj[k] == "string" && obj[k].indexOf(",") > 0) {
                    obj[k] = obj[k]
                        .split(",")
                        .map((e) => Number(Number(e).toFixed(3)));
                }
            }
            setPath2(obj);
        }
        return animation;
    }

    return (
        <>
            <div
                className="navbar-wrapper top"
                ref={wrapper}
                style={{ height: svgHeight }}>
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
});
export default Header;
