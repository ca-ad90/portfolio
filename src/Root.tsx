import Header from "./parts/Header";
import { DocContext, ScrollContext } from "./docContext.ts";
import Footer from "./parts/Footer";
import {
    MutableRefObject,
    useRef,
    useState,
    useEffect,
    useCallback,
    UIEventHandler,
    WheelEventHandler,
} from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, useScroll } from "framer-motion";
const useDoc = (
    initaialValue = document.createElement("div"),
): [
    MutableRefObject<HTMLDivElement | null>,
    (value: HTMLDivElement | null) => void,
] => {
    const docCont = useRef<HTMLDivElement | null>(initaialValue);

    function setDoc(value: HTMLDivElement | null) {
        if (value === null) return;
        docCont.current = value;
    }

    return [docCont, setDoc];
};
let headerList = [
    {
        path: "/",
        name: "Home",
    },
    { path: "/portfolio", name: "Portfolio" },
];

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

function useCurrentIndex(
    maxSections: number,
): [
    number,
    (number?: number) => void,
    () => number,
    (number?: number) => void,
    () => number,
    (number: number) => void,
    (max: number) => void,
] {
    const [index, setIndex] = useState(0);
    const max = useRef(maxSections);

    function setPrevIndex(i?: number): void {
        i = i ? i : index;
        let prev = i > 0 ? i - 1 : 0;

        return setIndex(prev);
    }

    function setNextIndex(i?: number): void {
        i = i ? i : index;
        let next = i < max.current ? i + 1 : i;
        console.log(next);

        return setIndex(next);
    }
    function setNewIndex(i: number): void {
        let prev = i > 0 ? i - 1 : 0;
        let next = i < max.current ? i + 1 : i;
        let newIndex = i == index ? index : i > index ? next : prev;
        return setIndex(newIndex);
    }
    const setMax = (maxValue: number) => {
        max.current = maxValue;
    };
    let prevIndex = () => (index > 0 ? index - 1 : 0);
    let nextIndex = () => (index < max.current ? index + 1 : index);

    return [
        index,
        setPrevIndex,
        prevIndex,
        setNextIndex,
        nextIndex,
        setNewIndex,
        setMax,
    ];
}
function preventdefault(e: Event) {
    return e.preventDefault();
}
function useToggleScollListener(): [boolean, () => void] {
    const [isListening, setIsListening] = useState(true);

    function toggleListen() {
        return (() => setIsListening(!isListening))();
    }
    return [isListening, toggleListen];
}

export default function Root(): JSX.Element {
    const _freq = useRef({ n: 0, time: new Date().getTime() });
    const dir = useRef(0);
    const [
        currentIndex,
        setPrevIndex,
        prevIndex,
        setNextIndex,
        nextIndex,
        setNewIndex,
        setMax,
    ] = useCurrentIndex(0);

    const [isScrolling, setIsScrolling] = useState(false);
    const [isEventStart, setEventStart] = useState(false);

    const [doc, setDoc] = useDoc(document.createElement("div"));
    const isRunning = useRef<boolean>(false);
    const tmpIndex = useRef<number>(0);
    const [isListening, toggleListen] = useToggleScollListener();

    let footerSection = useRef<SectionElement>(null);
    let scrollSections = useRef<Array<SectionElement>>([]);

    function getNextSection() {
        let next;
        if (dir.current > 0) {
            next =
                tmpIndex.current < scrollSections.current.length - 1
                    ? tmpIndex.current + 1
                    : tmpIndex.current;
        } else {
            next = tmpIndex.current > 0 ? tmpIndex.current - 1 : 0;
        }
        return next;
    }

    function getPrevSection() {
        let prev;

        if (dir.current > 0) {
            prev = tmpIndex.current > 0 ? tmpIndex.current - 1 : 0;
        } else {
            prev =
                tmpIndex.current + 1 < scrollSections.current.length
                    ? tmpIndex.current + 1
                    : tmpIndex.current;
        }
        return prev;
    }

    function disableScroll() {
        console.log("disableScroll");
        var wheelEvent =
            "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

        doc.current?.addEventListener(wheelEvent, preventdefault, false);

        doc.current?.addEventListener("keydown", preventdefault, false);
        doc.current?.addEventListener("touchmove", preventdefault, false);
        if (doc.current == null) return;
        doc.current.onwheel = wLock;
        //doc.ontouchstart = null;
        //doc.ontouchmove = null;
        //doc.ontouchend = null;
        window.onkeydown = null;
    }
    function enableSctoll() {
        console.log("enableScroll", "current:", tmpIndex.current);
        var wheelEvent =
            "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

        doc.current?.removeEventListener(wheelEvent, preventdefault, false);

        doc.current?.removeEventListener("keydown", preventdefault, false);
        doc.current?.removeEventListener("touchmove", preventdefault, false);
        if (doc.current == null) return;
        doc.current.onwheel = wHandler;
        // doc.ontouchstart = this.touchHandler.bind(this);
        // doc.ontouchmove = this.touchHandler.bind(this);
        // doc.ontouchend = this.touchHandler.bind(this);
        window.onkeydown = keyHandler;
    }

    function setScrollSections(sections: MutableRefObject<SectionElement[]>) {
        setMax(sections.current.length - 1);
        console.log("Max is set to:", sections.current.length);
        sections.current.forEach((e, i) => {
            scrollSections.current[i] = e;
        });
        console.log(
            "scrollsections set",
            scrollSections.current[tmpIndex.current],
        );
        enableSctoll();
    }

    function getFreq() {
        let time = new Date().getTime();
        if (time - _freq.current.time > 100 || _freq.current == null) {
            _freq.current.time = time;
            _freq.current.n = 0;
        }
        _freq.current.n = _freq.current.n + dir.current;
        _freq.current.time = new Date().getTime();
        return _freq.current.n;
    }

    function wLock(e: WheelEvent) {
        if (e.ctrlKey) return;
        // scroll scounter - when listener is "killed"
        e.preventDefault();
        if (dir.current != -e.wheelDeltaY / Math.abs(e.wheelDeltaY)) {
            _freq.current.n = 0;
            _freq.current.time = 0;
        }

        getFreq();
    }
    interface WheelYEvent extends WheelEvent {
        wheelDeltaY: number;
    }
    function wHandler(e: WheelYEvent) {
        let target: Element;
        function findParent(el: Element, classname: string): boolean {
            let p = el.parentElement;
            if (p == null) return false;
            if (
                p.classList.contains(classname) ||
                el.classList.contains(classname)
            ) {
                return true;
            } else {
                console.log("no match", p.tagName);
                if (p.tagName.toLowerCase() == "body") {
                    return false;
                } else {
                    return findParent(p, classname);
                }
            }
        }
        if (!(e.target instanceof Element)) {
            console.log("BAJS");
            return;
        }
        target = e.target as Element;
        if (findParent(target, "scroller")) return;

        console.log("wheelDelta", e.wheelDeltaY);
        console.log("delta", e.deltaY);
        if (e.ctrlKey) return;
        e.preventDefault();
        console.log(getFreq());

        /*
            if scrollDirection changes, restart scrollCounter(freq)
        */
        if (dir.current != -e.wheelDeltaY / Math.abs(e.wheelDeltaY)) {
            _freq.current.n = 0;
        }

        // set scrollDirection 1 == down, -1 == up

        dir.current = -e.wheelDeltaY / Math.abs(e.wheelDeltaY);
        console.log(dir.current);
        if (partialScroll()) return;

        // trigger scrollEvent if scrollCounter > 3
        if (Math.abs(getFreq()) > 3) {
            tmpIndex.current = getNextSection();
            console.log(tmpIndex.current);
            console.log("scrollSectopns", scrollSections.current);

            scrollBy(
                scrollSections.current[tmpIndex.current].top,
                1000,
                0,
            ).then(() => {
                // restart listeners and set current section
                enableSctoll();
            });
        }
    }
    function keyHandler(e: KeyboardEvent) {
        e.preventDefault();
        // if scroll animation is running ignore and return
        if (isRunning) {
            return;
        }
        //set scroll direction

        /*key Up*/
        if (e.keyCode == 38 && isRunning) {
            dir.current = -1;
        }
        /*key Down*/
        if (e.keyCode == 40 && isRunning) {
            dir.current = 1;
        }

        // if partial scrolling in section
        if (partialScroll()) return;
        tmpIndex.current = getNextSection();
        scrollBy(scrollSections.current[tmpIndex.current].top, 1000, 0).then(
            () => {
                //restart listensers
                console.log(tmpIndex.current);
            },
        );
    }
    function partialScroll() {
        // partial scrolling of section, if section is lager than vh
        console.log(tmpIndex.current);
        //set section scroll end depending on direction
        let scrollBottom =
            dir.current > 0
                ? Math.ceil(scrollSections.current[tmpIndex.current].bottom)
                : Math.floor(scrollSections.current[tmpIndex.current].top);

        //if scrolling down, scroll 80 extra before jumping to next section
        let offset = dir.current < 0 ? 0 : 80;

        // if section has overflow(larger than 100vh) and section scrollEnd is larger than offset
        if (
            scrollBottom <= offset - 1 &&
            scrollSections.current[tmpIndex.current].overflow
        ) {
            // set partial scroll length
            // default 100px, but set minimum scroll length to 100 (to avoid small scrolls that feels unnecescary)
            let len =
                scrollBottom + 200 < offset
                    ? 200
                    : offset - scrollBottom > 100
                    ? offset - scrollBottom
                    : 100;

            //scroll set direction, positive or negative length
            scrollBy(len * dir.current, 500, 0);
            return true;
        } else {
            //if no scroll needed return false
            return false;
        }
    }
    function curve(x: number): number {
        //return animation timing curve
        return 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
    }
    useEffect(() => {
        setNewIndex(tmpIndex.current);
    }, [tmpIndex]);

    function scrollBy(length: number, duration = 500, step: number) {
        // Promise so that listeners can be activated after scrolling is done
        isRunning.current = true;
        return new Promise((res) => {
            // Set start as scrollTop on animation start
            if (doc.current == null) return;
            let startPos = doc.current.scrollTop;
            console.log("Scrollby");
            // Kill listeners so no event triggers during animation.
            disableScroll();

            let startTime = new Date().getTime();

            /*
            The scroll animation loop,
            passing startTime, start position (from), length and duration
            makes sure that evnet parameters always is in the loop
            */
            let scrollAnimation = (
                starttime: number,
                from: number,
                length: number,
                duration: number,
            ) => {
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
                if (doc.current === null) return;
                doc.current.scrollTo({
                    top: f + len * q,
                    behavior: "auto",
                });

                // if part of scoll length == 100%
                if (x == 1) {
                    // true: end animation aenableSctoll()
                    enableSctoll();
                    window.cancelAnimationFrame(frame);
                    // resolve promise
                    res("done");
                } else {
                    // else: request new animation frame
                    window.requestAnimationFrame(
                        scrollAnimation.bind(doc.current, st, f, length, d),
                    );
                }
            };
            //Start Loop
            let frame = window.requestAnimationFrame(
                scrollAnimation.bind(
                    doc.current,
                    startTime,
                    startPos,
                    length,
                    duration,
                ),
            );
        });
    }

    /*     function touchHandler(e: TouchEvent) {
        if (isRunning) {
            return;
        }
        let scrollLen: number;
        let scrollMax: number;
        let isScrolling: boolean = false;
        let posY: number;
        let posYStart = e.touches[0].clientY;

        if (e.type == "touchstart") {
            if (!isScrolling && !isEventStart) {
            scrollLen = 0;
            scrollMax = 0;
            isScrolling = true;
            }
        }

        if (e.type == "touchmove") {
            if (isScrolling && isRunning) {
                if (!posY) {
                    posY = posYStart;
                }

                dir.current =
                    (posYStart - e.touches[0].clientY) /
                    Math.abs(posYStart - e.touches[0].clientY);

                scrollLen = Math.abs(posYStart - e.touches[0].clientY);
                scrollMax = Math.max(scrollMax, scrollLen);

                if (dir.current > 0) {
                    if (
                        (scrollSections.current[tmpIndex.current + 1].top <
                            window.innerHeight / 2 ||
                            scrollSections.current[currentIndex].bottom >
                                this.offset.bottom) &&
                        this.scrollLen > 200 &&
                        this.scrollMax - this.scrollLen < 75
                    ) {
                        this.touchReady = true;
                        $(document.querySelector(".touch-block"))
                            .removeClass("up")
                            .addClass("down")
                            .fadeIn();
                    } else {
                        this.touchReady = false;
                        $(document.querySelector(".touch-block")).fadeOut(
                            "fast",
                        );
                    }
                } else {
                    if (
                        (scrollSections.current[currentIndex].top >
                            window.innerHeight / 2 ||
                            scrollSections.current[currentIndex].bottom <
                                window.innerHeight - 100) &&
                        this.scrollLen > 200 &&
                        this.scrollMax - this.scrollLen < 75
                    ) {
                        this.touchReady = true;
                        $(document.querySelector(".touch-block"))
                            .removeClass("down")
                            .addClass("up")
                            .fadeIn();
                    } else {
                        this.touchReady = false;
                        $(document.querySelector(".touch-block")).fadeOut(
                            "fast",
                        );
                    }
                }
                let defaltscroll = this.posY - e.touches[0].clientY;
                if (this.touchReady) {
                    defaltscroll = defaltscroll / 2;
                    isEventStart = true;
                } else {
                    isEventStart = false;
                }
                this.scr;

                doc.current.scrollBy({
                    top: defaltscroll,
                });

                this.posY = e.touches[0].clientY;
            }
        }

        if (e.type == "touchend") {
            $(document.querySelector(".touch-block")).fadeOut("fast");
            if (isRunning) {
                if (isEventStart) {
                    isScrolling = false;
                    scrollSections.current[currentIndex] =
                        scrollSections.current[currentIndex];
                    isEventStart = false;
                    this.scrollEvent();
                } else if (
                    !scrollSections.current[currentIndex].overflow &&
                    isScrolling
                ) {
                    scrollSections.current[currentIndex].view;
                } else if (scrollSections.current[currentIndex].overflow) {
                    if (
                        scrollSections.current[currentIndex].bottom >=
                        this.offset.bottom
                    ) {
                        doc.current.scrollBy({
                            top:
                                this.offset.bottom -
                                scrollSections.current[currentIndex].bottom,
                            behavior: "smooth",
                        });
                    }
                    if (
                        scrollSections.current[currentIndex].top >=
                        this.offset.top
                    ) {
                        doc.current.scrollBy({
                            top:
                                scrollSections.current[currentIndex].top -
                                this.offset.top,
                            behavior: "smooth",
                        });
                    }
                }
            }

            this.posYStart = null;
            this.posY = null;
            this.touchYinit = null;
            this.posY = null;
            isScrolling = false;
        }
    }
    function touchStart(e: TouchEvent) {
        this.drag.start(e);
        this.startTop = doc.current.scrollTop;
    }
    function touchMove(e: TouchEvent) {
        this.drag.dragging(e);
        let len = this.drag.len;
        doc.current.scrollTo({
            top: this.startTop + len.y,
            behavior: "auto",
        });
        dir.current = len.y > 0 ? 1 : -1;
    }
    function touchEnd(e: TouchEvent) {
        this.drag.end(e);
    } */
    /*     let dragHandler =
     class {
        constructor(scrollEventHandler, dragElement) {
            this.top = scrollEventHandler;
            this.isDragging = false;
            this.startX;
            this.startY;
            this.x;
            this.y;
            this.max = 150;
            this.speed = 1;
            this.element = dragElement;
            this.distY = 0;
            this.distX = 0;
        }
        get len() {
            return {
                x: this.distX,
                y: this.distY * -1,
            };
        }
        get killListeners() {
            dragElement.ontouchstart = null;
            dragElement.ontouchmove = null;
            dragElement.ontouchend = null;
        }
    enableSctoll()() {
            dragElement.ontouchstart = this.start.bind(this);
            dragElement.ontouchmove = this.dragging.bind(this);
            dragElement.ontouchend = this.end.bind(this);
        }

        start(e) {
            e.preventDefault();

            this.isDragging = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.distX = 0;
            this.distY = 0;
        }
        dragging(e) {
            e.preventDefault();
            if (!this.isDragging) return;
            let dist = e.changedTouches[0];
            this.distX = dist.clientX - this.startX;
            this.distY = dist.clientY - this.startY;
        }
        end(e) {
            e.preventDefault();
            if (!this.isDragging) return;
            this.isDragging = false;
            let dist = e.changedTouches[0];
            this.distX = dist.clientX - this.startX;
            this.distY = dist.clientY - this.startY;
            setTimeout(() => {
                if (!this.isDragging) {
                    this.distX = 0;
                    this.distY = 0;
                }
            }, 100);
        }
    }; */
    return (
        <>
            <Header list={headerList} />
            <div id="parallax-wrapper" ref={(el) => setDoc(el)}>
                <div className="parallax-bg img-1"></div>
                <div className="parallax-bg img-2"></div>
                <div id="grid-wrapper">
                    <DocContext.Provider value={{ doc: doc, setDoc: setDoc }}>
                        <AnimatePresence mode="wait">
                            <Outlet context={setScrollSections} />
                        </AnimatePresence>
                    </DocContext.Provider>
                </div>
                <Footer name="myFoot" />
            </div>
        </>
    );
}
