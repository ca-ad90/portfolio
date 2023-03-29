import Header from "./parts/Header";
import { Section, Sections } from "./parts/Section";
import Footer from "./parts/Footer";
import "./App.css";
import { createRef, useEffect, useRef, useContext, useState } from "react";
import { MouseContext } from "./context.js";

function App() {
    const [mouse, setMouse] = useState({ x: null, y: null });
    useEffect(() => {
        window.addEventListener("pointermove", pointerMove);
        return () => window.removeEventListener("pointermove", pointerMove);
    }, []);

    function pointerMove(e) {
        setMouse({
            x: e.clientX,
            y: e.clientY,
        });
    }
    const doc = useRef(null);
    const sections: any = new Array(Sections.length + 2)
        .fill(null)
        .map((_, i) => createRef());
    interface SectionElement extends Element {
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
    }
    let currentIndex = useRef(0);

    let running = false;

    let dir = useRef(1);

    let _freq = {
        n: 0,
        time: null,
    };
    let frame = useRef(setTimeout(() => {}, 1));
    let section: NodeListOf<SectionElement> | any;
    useEffect(() => {
        try {
            section = sections.map((e) => e.current);
            section.forEach((e, i) => {
                Object.defineProperties(e, {
                    height: {
                        get: function () {
                            let h = this.getBoundingClientRect().height;
                            return h;
                        },
                        configurable: true,
                    },
                    top: {
                        get: function () {
                            let h = this.getBoundingClientRect().top;
                            return h;
                        },
                        configurable: true,
                    },
                    bottom: {
                        get: function () {
                            let t =
                                window.innerHeight - (this.top + this.height);
                            return t;
                        },
                        configurable: true,
                    },
                    y: {
                        get: function () {
                            let h = this.getBoundingClientRect().y;
                            return h;
                        },
                        configurable: true,
                    },

                    overflow: {
                        get: function () {
                            var offset: number;
                            if (
                                currentIndex.current === 0 ||
                                currentIndex.current === section.length - 1
                            ) {
                                offset = 0;
                            } else {
                                offset = 200;
                            }
                            return this.height + offset > window.innerHeight;
                        },
                    },
                    offset: {
                        get: function () {
                            let spaceLeft =
                                window.innerHeight -
                                section[currentIndex.current].height;
                            let offsetTop = (spaceLeft / 2) * 0.9;
                            let offsetBottom = (spaceLeft / 2) * 1.1;
                            return {
                                top: offsetTop,
                                bottom: offsetBottom,
                                gap:
                                    window.innerHeight -
                                    section[currentIndex.current].height,
                            };
                        },
                    },
                    index: {
                        get() {
                            return i;
                        },
                    },
                    next: {
                        get: function () {
                            let next: SectionElement | Element;
                            if (dir.current > 0) {
                                next =
                                    this.index < section.length - 1
                                        ? section[this.index + 1]
                                        : (next = this);
                            } else {
                                next =
                                    this.index > 0
                                        ? section[this.index - 1]
                                        : (next = this);
                            }
                            return next;
                        },
                    },
                    prev: {
                        get: function () {
                            let next: SectionElement | Element;
                            if (dir.current < 0) {
                                next =
                                    this.index < section.length - 1
                                        ? section[this.index + 1]
                                        : (next = this);
                            } else {
                                next =
                                    this.index > 0
                                        ? section[this.index - 1]
                                        : (next = this);
                            }
                            return next;
                        },
                    },
                    current: {
                        get() {
                            let index = currentIndex.current
                                ? currentIndex.current
                                : 0;
                            return section[index];
                        },
                    },
                });
            });
        } catch (err) {
            if (Object.prototype.hasOwnProperty.call(section[0], "overflow")) {
            } else {
            }
        }
        startListeners();
    });
    function keyHandler(e) {
        e.preventDefault();
        // if scroll animation is running ignore and return
        if (running) {
            return;
        }
        //set scroll dir.currentection

        /*key Up*/
        if (e.keyCode == 38 && !running) {
            dir.current = -1;
        }
        /*key Down*/
        if (e.keyCode == 40 && !running) {
            dir.current = 1;
        }

        // if partial scrolling in section
        if (partialScroll()) return;

        scrollBy(section[currentIndex.current].next.top, 1000, false).then(
            () => {
                //restart listensers
                startListeners();
                currentIndex.current = section[currentIndex.current].next.index;
            },
        );
    }
    function killListeners() {
        doc.current.onwheel = wLock.bind(this);
        window.onkeydown = null;
    }
    function startListeners() {
        doc.current.onwheel = wHandler.bind(this);
        window.onkeydown = keyHandler.bind(this);
    }
    let freq = () => {
        let time = new Date().getTime();
        if (time - _freq.time > 100 || _freq == null) {
            _freq.time = time;
            _freq.n = 0;
        }
        _freq.n += dir.current;
        _freq.time = new Date().getTime();
        return _freq.n;
    };
    function wHandler(e) {
        if (e.ctrlKey) return;
        e.preventDefault();

        if (dir.current !== e.deltaY / Math.abs(e.deltaY)) {
            _freq.n = 0;
        }
        dir.current = e.deltaY / Math.abs(e.deltaY);

        if (partialScroll()) {
            return;
        }

        // trigger scrollEvent if scrollCounter > 3
        if (Math.abs(freq()) > 3) {
            scrollBy(section[currentIndex.current].next.top, 1000, false).then(
                () => {
                    // restart listeners and set current section
                    startListeners();
                    currentIndex.current =
                        section[currentIndex.current].next.index;
                },
            );
        }
    }
    function curve(x) {
        //return animation timing curve
        return 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
    }
    function wLock(e) {
        if (e.ctrlKey) return;

        // scroll scounter - when listener is "killed"
        e.preventDefault();
        if (dir.current != e.deltaY / Math.abs(e.deltaY)) {
            _freq.n = 0;
            _freq.time = null;
        }
        freq();
    }
    function partialScroll() {
        let returnValue: Boolean;
        // partial scrolling of section, if section is lager than vh

        //set section scroll end depending on dir.currentection

        let scrollBottom =
            dir.current > 0
                ? Math.ceil(section[currentIndex.current].bottom)
                : Math.floor(section[currentIndex.current].top);

        //if scrolling down, scroll 80 extra before jumping to next section
        let offset = dir.current < 0 ? 0 : 80;

        // if section has overflow(larger than 100vh) and section scrollEnd is larger than offset
        if (
            scrollBottom <= offset - 1 &&
            section[currentIndex.current].overflow
        ) {
            // set partial scroll length
            // default 100px, but set minimum scroll length to 100 (to avoid small scrolls that feels unnecescary)
            let len =
                scrollBottom + 200 < offset
                    ? 200
                    : offset - scrollBottom > 100
                    ? offset - scrollBottom
                    : 100;

            //scroll set dir.currentection, positive or negative length
            scrollBy(len * dir.current, 500, true);
            returnValue = true;
        } else {
            //if no scroll needed return false
            returnValue = false;
        }
        return returnValue;
    }
    function scrollBy(length, duration = 500, step) {
        // Promise so that listeners can be activated after scrolling is done
        return new Promise((res) => {
            // Set start as scrollTop on animation start
            let startPos = doc.current.scrollTop;

            // Kill listeners so no event triggers during animation.
            killListeners();

            let startTime = new Date().getTime();

            /*
            The scroll animation loop,
            passing startTime, start position (from), length and duration
            makes sure that evnet parameters always is in the loop
            */
            function scrollAnimation(
                starttime: number,
                from: number,
                length: number,
                duration: number,
            ): void {
                let st = starttime;
                let f = from;
                let len = length;
                let d = duration;
                let currentTime = new Date().getTime();
                let elapsed = currentTime - st;

                // calculate part of elapsed time of duration as x
                // Math.min so that x always ends att 1.
                let x = Math.min(1, elapsed / d);

                // get multiplier from timeing curve
                // f(x) = current part of full length
                let q = curve(x);
                doc.current.scrollTo({
                    top: f + len * q,
                    behavior: "auto",
                });

                if (x == 1) {
                    startListeners();
                    clearInterval(frame.current);

                    res(true);
                } else {
                    // else: request new animation frame
                    /* window.requestAnimationFrame(
                        scrollAnimation.bind(this, st, f, length, d),
                    ); */

                    frame.current = setTimeout(
                        scrollAnimation,
                        2,
                        st,
                        f,
                        length,
                        d,
                    );
                }
            }
            //Start Loop
            frame.current = setTimeout(
                scrollAnimation,
                2,
                startTime,
                startPos,
                length,
                duration,
            );
        });
    }

    return (
        <>
            {" "}
            <MouseContext.Provider value={mouse}>
                <Header ref={sections[0]} />
            </MouseContext.Provider>
            <div id="parallax-wrapper" ref={doc}>
                <div className="parallax-bg img-1"></div>
                <div className="parallax-bg img-2"></div>

                <div id="grid-wrapper" style={{ top: "0px" }}>
                    <main>
                        {Sections.map((e, i) => {
                            return (
                                <Section
                                    name={e.name}
                                    descr={e.descr}
                                    key={e.name}
                                    ref={sections[i + 1]}>
                                    <e.content data={e.props.data} />
                                </Section>
                            );
                        })}
                    </main>
                </div>
                <Footer name="myFoot" ref={sections[sections.length - 1]} />
            </div>
        </>
    );
}

export default App;
