const header = document.querySelector("header");
const footer = document.querySelector("footer");
function setAttribute(element, ...attr) {
    if (typeof attr[0] === "string") {
        element.setAttribute(attr[0], attr[1]);
        return;
    } else {
        for (let a of attr) {
            element.setAttribute(a[0], a[1]);
        }
        return;
    }
}
class ScrollEffect {
    constructor() {
        window.doc = doc;
        doc.scrollTo({
            top: 0,
            behavior: "instant",
        });
        this.eventStart = false;
        this.running = false;
        this.eventDone = false;
        this._count = 0;
        this.n = 1;
        this.dir;
        this.wrapper = document.getElementById("grid-wrapper");
        this.section = document.querySelectorAll("header, section, footer");

        this.footer = document.querySelector("footer");
        this.header = document.querySelector("header");
        this.main = document.querySelector("main");

        this.touchReady = false;
        this.scrollLen;
        this._freq = {
            n: 0,
            time: null,
        };

        this.section.forEach((e) => {
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
                        let t = window.innerHeight - (this.top + this.height);
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
                view: {
                    get: () => {
                        doc.scrollBy({
                            top: e.top - e.offset.top,
                            behavior: "smooth",
                        });
                        this.current = e;
                    },
                },
                tag: {
                    get: function () {
                        return this.tagName.toLowerCase();
                    },
                },
                overflow: {
                    get: () => {
                        var offset;
                        if (
                            this.current.tag == "header" ||
                            this.current.tag == "footer"
                        ) {
                            offset = 0;
                        } else {
                            offset = 200;
                        }
                        return e.height + offset > window.innerHeight;
                    },
                },
                offsetGap: {
                    get: () => {
                        var offset;
                        if (
                            this.current.tag == "header" ||
                            this.current.tag == "footer"
                        ) {
                            offset = 0;
                            var out = 0;
                        } else {
                            offset = this.offset.bottom + this.offset.top;
                            var out =
                                window.innerHeight -
                                (this.current.height +
                                    this.offset.top +
                                    this.offset.bottom);
                        }
                        let offsetGap = {
                            height: this.current.height,
                            win: window.innerHeight,
                            offTop: this.offset.top,
                        };
                    },
                },
                offset: {
                    get: () => {
                        let spaceLeft =
                            window.innerHeight - this.current.height;
                        let offsetTop = (spaceLeft / 2) * 0.9;
                        let offsetBottom = (spaceLeft / 2) * 1.1;
                        return {
                            top: offsetTop,
                            bottom: offsetBottom,
                            gap: window.innerHeight - this.current.height,
                        };
                    },
                },
                wrapper: {
                    get: function () {
                        try {
                            return this.querySelector(".section-wrapper");
                        } catch {}
                    },
                },
            });
        });
        this.current = this.section[0];
        this.drag = new this.dragHandler(this, doc);

        doc.onwheel = this.wHandler.bind(this);
        doc.ontouchstart = this.touchStart.bind(this);
        doc.ontouchmove = this.touchMove.bind(this);
        doc.ontouchend = this.touchEnd.bind(this);
        window.onkeydown = this.keyHandler.bind(this);
    }
    get killListeners() {
        doc.onwheel = this.wLock.bind(this);
        //doc.ontouchstart = null;
        //doc.ontouchmove = null;
        //doc.ontouchend = null;
        window.onkeydown = null;
    }
    get startListeners() {
        doc.onwheel = this.wHandler.bind(this);
        // doc.ontouchstart = this.touchHandler.bind(this);
        // doc.ontouchmove = this.touchHandler.bind(this);
        // doc.ontouchend = this.touchHandler.bind(this);
        window.onkeydown = this.keyHandler.bind(this);
    }
    get offset() {
        var offsetBottom, offsetTop;
        var max = Math.min(window.innerHeight / 2, 400);
        if (this.current.overflow) {
            offsetBottom = Math.min(window.innerHeight / 9, 200);
            offsetTop = Math.min(window.innerHeight / 10, 100);
        } else {
            offsetBottom = this.current.offset.bottom - 1;
            offsetTop = this.current.offset.top - 1;
        }

        return {
            top: offsetTop,
            bottom: offsetBottom,
            max: max,
        };
    }
    get count() {
        return this._count;
    }
    set count(x) {
        this._count = x;
    }
    get nextSection() {
        let next;
        if (this.dir > 0) {
            if ($(this.current).next().length > 0) {
                if ($(this.current).next()[0].tagName == "MAIN") {
                    next = this.main.children[0];
                } else {
                    next = $(this.current).next()[0];
                }
            } else if (this.current.parentNode.tagName == "MAIN") {
                next = this.footer;
            } else {
                next = this.current;
            }
        } else {
            if ($(this.current).prev().length > 0) {
                if ($(this.current).prev()[0].tagName == "MAIN") {
                    next = this.main.children[this.main.children.length - 1];
                } else {
                    next = $(this.current).prev()[0];
                }
            } else if (this.current.parentNode.tagName == "MAIN") {
                next = this.header;
            } else {
                next = this.current;
            }
        }
        return next;
    }

    get prevSection() {
        let prev;

        if (this.dir > 0) {
            if ($(this.current).prev().length > 0) {
                if ($(this.current).prev()[0].tagName == "MAIN") {
                    prev = this.main.children[this.main.children.length - 1];
                } else {
                    prev = $(this.current).prev()[0];
                }
            } else if (this.current.parentNode.tagName == "MAIN") {
                prev = this.header;
            } else {
                prev = this.current;
            }
        } else {
            if ($(this.current).next().length > 0) {
                if ($(this.current).next()[0].tagName == "MAIN") {
                    prev = this.main.children[0];
                } else {
                    prev = $(this.current).next()[0];
                }
            } else if (this.current.parentNode.tagName == "MAIN") {
                prev = this.footer;
            } else {
                prev = this.current;
            }
        }
        return prev;
    }

    get freq() {
        let time = new Date().getTime();
        if (time - this._freq.time > 100 || this._freq == null) {
            this._freq.time = time;
            this._freq.n = 0;
        }
        this._freq.n += this.dir;
        this._freq.time = new Date().getTime();
        return this._freq.n;
    }
    get sLen() {
        return this.scrollLength;
    }

    wHandler(e) {
        if (e.ctrlKey) return;
        e.preventDefault();
        console.log(this.freq);

        /*
            if scrollDirection changes, restart scrollCounter(freq)
        */
        if (this.dir != -e.wheelDeltaY / Math.abs(e.wheelDeltaY)) {
            this._freq.n = 0;
        }

        // set scrollDirection 1 == down, -1 == up

        this.dir = -e.wheelDeltaY / Math.abs(e.wheelDeltaY);
        if (this.partialScroll()) return;

        // trigger scrollEvent if scrollCounter > 3
        if (Math.abs(this.freq) > 3) {
            this.scrollBy(this.nextSection.top, 1000, false).then(() => {
                // restart listeners and set current section
                this.startListeners;
                this.current = this.nextSection;
            });
        }
    }
    keyHandler(e) {
        e.preventDefault();
        // if scroll animation is running ignore and return
        if (this.running) {
            return;
        }
        //set scroll direction

        /*key Up*/
        if (e.keyCode == 38 && !this.running) {
            this.dir = -1;
        }
        /*key Down*/
        if (e.keyCode == 40 && !this.running) {
            this.dir = 1;
        }

        // if partial scrolling in section
        if (this.partialScroll()) return;

        this.scrollBy(this.nextSection.top, 1000, false).then(() => {
            //restart listensers
            this.startListeners;
            this.current = this.nextSection;
        });
    }
    curve(x) {
        //return animation timing curve
        return 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
    }
    scrollById(idSelector) {
        this.section.forEach((e, i) => {
            if (e.getAttribute("id") == idSelector) {
                this.scrollBy(e.top, 1000, false);
                this.current = e;
            }
        });
    }
    wLock(e) {
        console.log(this.freq);
        if (e.ctrlKey) return;
        // scroll scounter - when listener is "killed"
        e.preventDefault();
        if (this.dir != -e.wheelDeltaY / Math.abs(e.wheelDeltaY)) {
            this._freq.n = 0;
            this._freq.time = null;
        }
        this._freq.n;
        this.freq;
    }
    partialScroll() {
        // partial scrolling of section, if section is lager than vh

        //set section scroll end depending on direction
        let scrollBottom =
            this.dir > 0
                ? Math.ceil(this.current.bottom)
                : Math.floor(this.current.top);

        //if scrolling down, scroll 80 extra before jumping to next section
        let offset = this.dir < 0 ? 0 : 80;

        // if section has overflow(larger than 100vh) and section scrollEnd is larger than offset
        if (scrollBottom <= offset - 1 && this.current.overflow) {
            // set partial scroll length
            // default 100px, but set minimum scroll length to 100 (to avoid small scrolls that feels unnecescary)
            let len =
                scrollBottom + 200 < offset
                    ? 200
                    : offset - scrollBottom > 100
                    ? offset - scrollBottom
                    : 100;

            //scroll set direction, positive or negative length
            this.scrollBy(len * this.dir, 500, true);
            return true;
        } else {
            //if no scroll needed return false
            return false;
        }
    }
    scrollBy(length, duration = 500, step) {
        // Promise so that listeners can be activated after scrolling is done

        return new Promise((res) => {
            // Set start as scrollTop on animation start
            let startPos = doc.scrollTop;

            // Kill listeners so no event triggers during animation.
            this.killListeners;

            let startTime = new Date().getTime();

            /*
            The scroll animation loop,
            passing startTime, start position (from), length and duration
            makes sure that evnet parameters always is in the loop
            */
            let scrollAnimation = (starttime, from, length, duration) => {
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
                let q = this.curve(x);
                doc.scrollTo({
                    top: f + len * q,
                    behavior: "auto",
                });

                // if part of scoll length == 100%
                if (x == 1) {
                    // true: end animation and restartListeners
                    this.startListeners;
                    window.cancelAnimationFrame(frame);
                    // resolve promise
                    res();
                } else {
                    // else: request new animation frame
                    window.requestAnimationFrame(
                        scrollAnimation.bind(this, st, f, length, d),
                    );
                }
            };
            //Start Loop
            let frame = window.requestAnimationFrame(
                scrollAnimation.bind(
                    this,
                    startTime,
                    startPos,
                    length,
                    duration,
                ),
            );
        });
    }
    touchHandler(e) {
        if (this.running) {
            return;
        }

        if (e.type == "touchstart") {
            if (!this.isScrolling && !this.eventStart) {
                this.scrollLen = 0;
                this.scrollMax = 0;
                this.isScrolling = true;
                this.posYStart = e.touches[0].clientY;
            }
        }
        if (e.type == "touchmove") {
            if (this.isScrolling && !this.running) {
                if (!this.posY) {
                    this.posY = this.posYStart;
                }
                this.dir =
                    (this.posYStart - e.touches[0].clientY) /
                    Math.abs(this.posYStart - e.touches[0].clientY);
                this.scrollLen = Math.abs(
                    this.posYStart - e.touches[0].clientY,
                );
                this.scrollMax = Math.max(this.scrollMax, this.scrollLen);

                if (this.dir > 0) {
                    if (
                        (this.nextSection.top < window.innerHeight / 2 ||
                            this.current.bottom > this.offset.bottom) &&
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
                        (this.current.top > window.innerHeight / 2 ||
                            this.nextSection.bottom <
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
                    this.eventStart = true;
                } else {
                    this.eventStart = false;
                }
                this.scr;

                doc.scrollBy({
                    top: defaltscroll,
                });

                this.posY = e.touches[0].clientY;
            }
        }

        if (e.type == "touchend") {
            $(document.querySelector(".touch-block")).fadeOut("fast");
            if (!this.running) {
                if (this.eventStart) {
                    this.isScrolling = false;
                    this.current = this.nextSection;
                    this.eventStart = false;
                    this.scrollEvent();
                } else if (!this.current.overflow && this.isScrolling) {
                    this.current.view;
                } else if (this.current.overflow) {
                    if (this.current.bottom >= this.offset.bottom) {
                        doc.scrollBy({
                            top: this.offset.bottom - this.current.bottom,
                            behavior: "smooth",
                        });
                    }
                    if (this.current.top >= this.offset.top) {
                        doc.scrollBy({
                            top: this.current.top - this.offset.top,
                            behavior: "smooth",
                        });
                    }
                }
            }

            this.posYStart = null;
            this.posY = null;
            this.touchYinit = null;
            this.posY = null;
            this.isScrolling = false;
        }
    }
    touchStart(e) {
        this.drag.start(e);
        this.startTop = doc.scrollTop;
    }
    touchMove(e) {
        this.drag.dragging(e);
        let len = this.drag.len;
        doc.scrollTo({
            top: this.startTop + len.y,
            behavior: "auto",
        });
        this.dir = len.y > 0 ? 1 : -1;
    }
    touchEnd(e) {
        this.drag.end(e);
    }
    dragHandler = class {
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
        get startListeners() {
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
    };
}
class GalleryCarousel {
    constructor(element) {
        this.wrapper = document.querySelector(".gallery-wrapper");

        this.galleryImgCont = document.querySelector(
            ".gallery-container.gallery-img",
        );
        this.galleryTxtCont = document.querySelector(
            ".gallery-container.gallery-text",
        );
        this.galleryItems = {
            img: this.galleryImgCont.querySelectorAll(".gallery-item"),
            txt: this.galleryTxtCont.querySelectorAll(".gallery-item"),
            dot: this.wrapper.querySelectorAll(".gallery-dot"),
            len: this.galleryImgCont.querySelectorAll(".gallery-item").length,
        };
        this.currentIndex = 0;
        this.res = {
            in: () => {},
            out: () => {},
            next: () => {},
            prev: () => {},
            goto: () => {},
            play: () => {},
        };
        this.reject = {
            in: () => {},
            out: () => {},
        };
        this.isRunning = [false, false];
        this.isPlaying = false;
        this.speed = 800;
        this.galleryItems.dot.forEach((e, i) => {
            e.addEventListener("click", async () => {
                clearTimeout(this.timeout);
                this.cancel;
                this.goToIndex = i;
                this.moveDot(i);
                this.goTo(this.goToIndex)
                    .then(() => {
                        clearTimeout(this.timeout);
                        this.timeout = setTimeout(
                            this.play.bind(this),
                            this.speed * 6,
                        );
                    })
                    .catch((e) => {})
                    .finally(() => {
                        this.isPlaying = false;
                    });
            });
        });
        this._goToIndex = -1;
        this.wrapper
            .querySelector(".svg-arrow-right")
            .addEventListener("click", async () => {
                clearTimeout(this.timeout);
                this.cancel;
                this.goToIndex = this.checkIndex(this.goToIndex + 1);
                this.moveDot(this.goToIndex);
                this.goTo(this.goToIndex)
                    .then(() => {
                        clearTimeout(this.timeout);
                        this.timeout = setTimeout(
                            this.play.bind(this),
                            this.speed * 6,
                        );
                    })
                    .catch((e) => {})
                    .finally(() => {
                        this.isPlaying = false;
                    });
            });

        this.wrapper
            .querySelector(".svg-arrow-left")
            .addEventListener("click", async () => {
                clearTimeout(this.timeout);
                this.cancel;
                this.goToIndex = this.checkIndex(this.goToIndex - 1);
                this.moveDot(this.goToIndex);
                this.goTo(this.goToIndex)
                    .then(() => {
                        clearTimeout(this.timeout);
                        this.timeout = setTimeout(
                            this.play.bind(this),
                            this.speed * 6,
                        );
                    })
                    .catch((e) => {})
                    .finally(() => {
                        this.isPlaying = false;
                    });
            });
        this.play();
        document
            .querySelector(".gallery-container.gallery-img")
            .addEventListener("click", () => {});
    }
    get goToIndex() {
        try {
            if (this._goToIndex < 0) {
                this._goToIndex = this.index;
                return this.index;
            } else return this._goToIndex;
        } catch (e) {}
    }
    set goToIndex(x) {
        try {
            this._goToIndex = x;
        } catch (e) {
            console.error(e);
        }
    }
    get index() {
        try {
            return this.currentIndex;
        } catch (e) {
            console.error(e);
        }
    }
    set index(x) {
        try {
            this.currentIndex = x;
        } catch (e) {
            console.error(e);
        }
    }
    get nextIndex() {
        try {
            return this.index + 2 > this.galleryItems.len ? 0 : this.index + 1;
        } catch (e) {
            console.error(e);
        }
    }
    get prevIndex() {
        try {
            return this.index - 1 < 0
                ? this.galleryItems.len - 1
                : this.index - 1;
        } catch (e) {
            console.error(e);
        }
    }
    get cancel2() {
        try {
            this.reject.in();
            this.reject.out();
        } catch (e) {
            console.error(e);
        }
    }
    get cancel() {
        try {
            this.res.in();
            this.res.out();
            this.isPlaying = false;
            clearTimeout(this.timeout);
        } catch (e) {
            console.error(e);
        }
    }
    moveDot(i, end) {
        try {
            this.galleryItems.dot.forEach((e) => {
                if (e.classList.contains("active")) {
                    if (end && this.index == i) {
                        return;
                    }
                    e.classList.remove("active");
                }
            });
            this.galleryItems.dot[i].classList.add("active");
        } catch (e) {
            console.error(e);
        }
    }
    async fadeOut(index) {
        try {
            var imgRes;
            var txtRes;
            var imgRej;
            var txtRej;
            return new Promise(async (res, reject) => {
                this.reject.out = reject;
                if (this.isRunning.every((e) => e == true)) {
                } else {
                    this.isRunning[0] = true;
                }
                this.res.out = res;
                var txtOut = new Promise((res, reject) => {
                    txtRes = res;
                    txtRej = reject;
                    $(this.galleryItems.txt[index]).animate(
                        {
                            left: "125%",
                            opacity: 0.5,
                        },
                        this.speed,
                        () => {
                            $(this.galleryItems.txt[index])
                                .css("z-index", "-1")
                                .css("opacity", "0")
                                .css("left", "-125%")
                                .hide();
                            res("text out resolve");
                        },
                    );
                }).finally(() => {
                    $(this.galleryItems.txt[index])
                        .css("z-index", "-1")
                        .css("left", "-125%")
                        .css("opacity", "0")
                        .hide();
                });
                var imgOut = new Promise((res, reject) => {
                    imgRes = res;
                    imgRej = reject;
                    $(this.galleryItems.img[index]).animate(
                        {
                            top: "125%",
                            opacity: 0.0,
                        },
                        this.speed,
                        () => {
                            $(this.galleryItems.img[index])
                                .css("z-index", "-1")
                                .css("opacity", "0")
                                .css("top", "-125%")
                                .hide();
                            res("img out resolve");
                        },
                    );
                }).finally(() => {
                    $(this.galleryItems.img[index])
                        .css("z-index", "-1")
                        .css("top", "-125%")
                        .css("opacity", "0")
                        .hide();
                });
                await Promise.all([txtOut, imgOut])
                    .then(() => {
                        imgRes("then img out resolve");
                        txtRes("then txt out resolv");
                        res("fade out resolve");
                    })
                    .catch((e) => {
                        reject("catch fade out reject");
                    })
                    .finally(() => {
                        this.isPlaying = false;
                    });
            });
        } catch (e) {
            console.error(e);
        }
    }
    async fadeIn(index) {
        try {
            var imgRes;
            var txtRes;
            var imgRej;
            var txtRej;
            return new Promise(async (res, reject) => {
                this.reject.in = reject;
                this.res.in = res;
                var txtIn = new Promise((res, reject) => {
                    txtRes = res;
                    txtRej = reject;
                    $(this.galleryItems.txt[index])
                        .show()
                        .css("z-index", "")
                        .animate(
                            {
                                left: "0%",
                                opacity: 1,
                            },
                            this.speed,
                            () => {
                                res("text in resolve");
                            },
                        );
                })
                    .catch((e) => {})
                    .finally(() => {
                        $(this.galleryItems.txt[index])
                            .show()
                            .css("z-index", "")
                            .css("left", "0%")
                            .css("opacity", "1");
                    });

                var imgIn = new Promise((res, reject) => {
                    imgRes = res;
                    imgRej = reject;
                    $(this.galleryItems.img[index])
                        .show()
                        .css("z-index", "")
                        .animate(
                            {
                                top: "0%",
                                opacity: 1,
                            },
                            this.speed,
                            () => {
                                res("img in resolve");
                            },
                        );
                })
                    .catch((e) => {})
                    .finally(() => {
                        $(this.galleryItems.img[index])
                            .show()
                            .css("z-index", "")
                            .css("top", "0%")
                            .css("opacity", "1");
                    });

                await Promise.all([txtIn, imgIn])
                    .then(() => {
                        imgRes("then img in resolve");
                        txtRes("then txt in resolv");
                        res("fade in resolve");
                    })
                    .catch((e) => {
                        reject("catch fade in reject");
                    })
                    .finally(() => {
                        this.isRunning[1] = false;
                    });
            });
        } catch (e) {
            console.error(e);
        }
    }
    async next() {
        try {
            var prevIndex = this.index;
            this.index = this.nextIndex;
            if (!this.isPlaying) {
                this.isPlaying = true;
                clearTimeout(this.timeout);
                return Promise.all([
                    this.fadeOut(prevIndex),
                    this.fadeIn(this.index),
                ]);
            }
        } catch (e) {
            console.error(e);
        }
    }
    async prev() {
        try {
            var prevIndex = this.index;
            this.index = this.prevIndex;
            if (!this.isPlaying) {
                this.isPlaying = true;
                clearTimeout(this.timeout);
                return Promise.all([
                    this.fadeOut(prevIndex),
                    this.fadeIn(this.index),
                ]);
            }
        } catch (e) {
            console.error(e);
        }
    }
    checkIndex(x) {
        try {
            var out =
                x > this.galleryItems.len - 1
                    ? 0
                    : x < 0
                    ? this.galleryItems.len - 1
                    : x;
            return out;
        } catch (e) {
            console.error(e);
        }
    }
    async goTo(index) {
        try {
            if (this.index == index) {
                return;
            }
            if (!this.isPlaying) {
                this.isPlaying = true;
                clearTimeout(this.timeout);

                await Promise.all([
                    this.fadeOut(this.index),
                    this.fadeIn(this.goToIndex),
                ]).then(() => {
                    this.isPlaying = false;
                    this._goToIndex = -1;
                    this.index = index;
                    this.timeout = setTimeout(
                        this.play.bind(this),
                        this.speed * 6,
                    );
                });
            }
        } catch (e) {
            console.error(e);
        }
        if (this.index == index) {
            return;
        }
        if (!this.isPlaying) {
            this.isPlaying = true;
            clearTimeout(this.timeout);

            await Promise.all([
                this.fadeOut(this.index),
                this.fadeIn(this.goToIndex),
            ]).then(() => {
                this.isPlaying = false;
                this._goToIndex = -1;
                this.index = index;
                this.timeout = setTimeout(this.play.bind(this), this.speed * 6);
            });
        }
    }
    async play() {
        try {
            if (!this.isPlaying) {
                clearTimeout(this.timeout);
                this.cancel;
                this.goToIndex = this.checkIndex(this.goToIndex + 1);
                this.moveDot(this.goToIndex);
                this.goTo(this.goToIndex)
                    .then(() => {
                        clearTimeout(this.timeout);
                        this.timeout = setTimeout(
                            this.play.bind(this),
                            this.speed * 6,
                        );
                    })
                    .catch((e) => {})
                    .finally(() => {
                        this.isPlaying = false;
                    });
            }
        } catch (e) {
            console.error(e);
        }
    }
}

/* Denna Klass vet jag inte hur mkt som är inspiration, eget påhitt eller plagiat*/
class SwipeHandler {
    constructor(el) {
        this.element = el;
        this.swipedir;
        this.startX;
        this.startY;
        this.distX;
        this.distY;
        this.threshold = 150; //required min distance traveled to be considered swipe
        this.restraint = 100; // maximum distance allowed at the same time in perpendicular direction
        this.allowedTime = 300; // maximum time allowed to travel that distance
        this.elapsedTime;
        this.startTime;
        this.dist;
        this._swipeUp = () => {};
        this._swipeDown = () => {};
        this._swipeLeft = () => {};
        this._swipeRight = () => {};
        this._swipeAll = () => {};

        this.element.addEventListener(
            "touchstart",
            this.swipeStart.bind(this),
            false,
        );

        this.element.addEventListener(
            "touchmove",
            this.swipeMove.bind(this),
            false,
        );

        this.element.addEventListener(
            "touchend",
            this.swipeEnd.bind(this),
            false,
        );
        return this.setSwipe.bind(this);
    }

    get swipeUp() {
        return this._swipeUp;
    }
    get swipeDown() {
        return this._swipeDown;
    }
    get swipeLeft() {
        return this._swipeLeft;
    }
    get swipeRight() {
        return this._swipeRight;
    }

    get swipeAll() {
        return this._swipeAll;
    }
    set swipeUp(callback) {
        return (this._swipeUp = callback.bind(this.element));
    }
    set swipeDown(callback) {
        return (this._swipeDown = callback.bind(this.element));
    }
    set swipeLeft(callback) {
        return (this._swipeLeft = callback.bind(this.element));
    }
    set swipeRight(callback) {
        return (this._swipeRight = callback.bind(this.element));
    }
    set swipeAll(callback) {
        return (this._swipeAll = callback.bind(this.element));
    }
    setSwipe(dir, callback) {
        switch (dir) {
            case "up":
                this.swipeUp = callback;
                break;
            case "down":
                this.swipeDown = callback;
                break;
            case "left":
                this.swipeLeft = callback;
                break;
            case "right":
                this.swipeRight = callback;
                break;
            case "all":
                this.swipeAll = callback;
                break;
        }
    }

    swipeEvent() {
        this.element.ontouchend = this.swipeEnd.bind(this, callback);
    }
    swipeStart(e) {
        var touchobj = e.changedTouches[0];
        this.swipedir = "none";
        this.dist = 0;
        this.startX = touchobj.pageX;
        this.startY = touchobj.pageY;
        this.startTime = new Date().getTime(); // record time when finger first makes contact with surface
    }
    swipeMove(e) {
        e.preventDefault(); // prevent scrolling when inside DIV
    }
    swipeEnd(e) {
        var touchobj = e.changedTouches[0];
        this.distX = touchobj.pageX - this.startX; // get horizontal dist traveled by finger while in contact with surface
        this.distY = touchobj.pageY - this.startY; // get vertical dist traveled by finger while in contact with surface
        this.elapsedTime = new Date().getTime() - this.startTime; // get time elapsed
        if (this.elapsedTime <= this.allowedTime) {
            // first condition for awipe met
            if (
                Math.abs(this.distX) >= this.threshold &&
                Math.abs(this.distY) <= this.restraint
            ) {
                // 2nd condition for horizontal swipe met
                this.swipedir = this.distX < 0 ? "left" : "right"; // if dist traveled is negative, it indicates left swipe
            } else if (
                Math.abs(this.distY) >= this.threshold &&
                Math.abs(this.distX) <= this.restraint
            ) {
                // 2nd condition for vertical swipe met
                this.swipedir = this.distY < 0 ? "up" : "down"; // if dist traveled is negative, it indicates up swipe
            }

            switch (this.swipedir) {
                case "up":
                    this.swipeUp(e);
                    break;
                case "down":
                    this.swipeDown(e);
                    break;
                case "left":
                    this.swipeLeft(e);
                    break;
                case "right":
                    this.swipeRight(e);
                    break;
            }
            this.swipeAll();
            this.dist = 0;
        }
    }
}
class PopupView {
    static currentViews = [];
    constructor(viewId) {
        fetch("./popup-settings.json")
            .then((res) => res.json())
            .then((data) => {
                console.log(`-----------FETCH DATA---------------`);
                console.log("data", data);
                this.el = [];
                data = data[viewId];
                let items = data.items;
                let PATH = data.path;

                var id = viewId;
                try {
                    if (PopupView.currentViews.indexOf(viewId) == -1) {
                        PopupView.currentViews.push(viewId);
                    } else {
                        id =
                            PopupView.currentViews.length < 9
                                ? "NewId-" + (PopupView.currentViews.length + 1)
                                : "NewId-0" +
                                  (PopupView.currentViews.length + 1);
                        throw new Error(
                            "NAME CONFLICT!\n" +
                                viewId +
                                'Allready exists, ID set to "' +
                                newId +
                                '".',
                        );
                    }
                } catch (err) {
                    PopupView.currentViews.push(id);
                    console.error(err);
                }
                this.id = id;

                this.container = document.createElement("div");
                this.container.setAttribute("id", this.id);
                this.container.classList.add("popUp");
                this.section = {
                    left: document.createElement("div"),
                    center: document.createElement("div"),
                    right: document.createElement("div"),
                };
                this.btn = {
                    left: document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg",
                    ),
                    right: document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "svg",
                    ),
                };
                let closeBtn = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg",
                );
                closeBtn.setAttribute("viewBox", "0 0 100 100");
                closeBtn.classList.add("closeBtn");
                let l1 = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line",
                );
                let l2 = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line",
                );

                setAttribute(
                    l1,
                    ["x1", "19.5"],
                    ["y1", "19.5"],
                    ["x2", "80.5"],
                    ["y2", "80.5"],
                );
                setAttribute(
                    l2,
                    ["x1", "19.5"],
                    ["y1", "80.5"],
                    ["x2", "80.5"],
                    ["y2", "19.5"],
                );
                closeBtn.appendChild(l1);
                closeBtn.appendChild(l2);
                this.container.appendChild(closeBtn);

                for (let dir in this.btn) {
                    this.btn[dir].classList.add("svg-arrow-" + dir, "noClose");
                    this.btn[dir].setAttribute("viewBox", "0 0 70 50");
                    let g = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "g",
                    );
                    g.classList.add("svgArrow", dir);
                    let arrow = [
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "path",
                        ),
                        document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "path",
                        ),
                    ];
                    arrow.forEach((e) => {
                        e.classList.add("arrow-btn");
                        g.appendChild(e);
                    });
                    let rect = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "rect",
                    );
                    rect.setAttribute("width", "70");
                    rect.setAttribute("height", "50");
                    g.appendChild(rect);
                    this.btn[dir].appendChild(g);
                    if (dir == "left") {
                        this.btn[dir].addEventListener(
                            "click",
                            (e) => {
                                this.getPrev;
                            },
                            false,
                        );
                    }
                    if (dir == "right") {
                        this.btn[dir].addEventListener(
                            "click",
                            (e) => {
                                this.getNext;
                            },
                            false,
                        );
                    }
                }

                this.items = [];
                for (let [index, item] of items.entries()) {
                    this.el[index] = document.querySelector(
                        `[data-setting="${viewId}"][data-item="${index}"]`,
                    );
                    var element, src, rub, text;
                    var textCont = document.createElement("div");
                    var imgCont = document.createElement("div");
                    var content = document.createElement("div");

                    content.classList.add("popup-content", "fadeOut");
                    textCont.classList.add("popup-text");
                    imgCont.classList.add("popup-img");

                    element = document.createElement(item.type);

                    element.setAttribute("src", "." + PATH + item.path);
                    element.classList.add("noClose");

                    imgCont.appendChild(element);

                    let r = document.createElement("h2");
                    r.innerHTML = item.title;
                    textCont.appendChild(r);

                    let t = document.createElement("p");
                    t.innerHTML = item.text;
                    textCont.appendChild(t);
                    content.appendChild(textCont);
                    content.appendChild(imgCont);

                    this.items.push(content);
                }
                this.items.forEach((e, i) => {
                    this.section.center.appendChild(e);
                    this.items[i].onswipe = new SwipeHandler(this.items[i]);
                    this.items[i].onswipe("left", () => {
                        this.getNext;
                    });
                    this.items[i].onswipe("right", () => {
                        this.getPrev;
                    });
                });
                for (let s in this.section) {
                    var sec = this.section[s];
                    sec.classList.add("popUpSection", "popup-" + s);
                    if (Object.keys(this.btn).indexOf(s) != -1) {
                        sec.appendChild(this.btn[s]);
                    }
                    this.container.appendChild(sec);
                }
                this._current = 0;
                this.el.forEach((e, i) => {
                    e.addEventListener(
                        "click",
                        this.openContainer.bind(this, i),
                    );
                });
                this.container.addEventListener(
                    "click",
                    this.closeContainer.bind(this),
                );
                this.container.style.display = "none";
                document.body.appendChild(this.container);
            });
    }
    get getNext() {
        if (this.items.length - 1 < this.current + 1) {
            this.setCurrent(0, "right");
            return 0;
        } else {
            this.setCurrent(this.current + 1, "right");
            return this.current;
        }
    }

    get getPrev() {
        if (0 > this.current - 1) {
            this.setCurrent(this.items.length - 1, "left");
            return this.current;
        } else {
            this.setCurrent(this.current - 1, "left");
            return this.current;
        }
    }

    set current(n) {
        this._current = n;
    }
    get current() {
        return this._current;
    }
    setCurrent(n, dir) {
        this.items[this.current].classList.remove(
            "rollInFromRight",
            "rollInFromLeft",
            "fadeIn",
        );
        this.items[n].classList.remove(
            "rollOutToLeft",
            "rollOutToRight",
            "fadeOut",
        );
        if (dir == "right") {
            this.items[this.current].classList.add("rollOutToLeft");
            this.items[n].classList.add("rollInFromRight");
        } else if (dir == "left") {
            this.items[this.current].classList.add("rollOutToRight");
            this.items[n].classList.add("rollInFromLeft");
        } else if (dir == "none") {
            this.items[this.current].classList.add("fadeOut");
            this.items[n].classList.add("fadeIn");
        }

        this.current = n;
    }
    openContainer(i, e) {
        //scrolling.killListeners;
        this.setCurrent(i, "none");
        this.container.style.display = "grid";
    }
    closeContainer(e) {
        if (
            e.target.classList.contains("closeBtn") ||
            $(e.target).parent()[0].classList.contains("closeBtn") ||
            e.target == this.container ||
            e.target.classList.contains("popup-content") ||
            e.target.classList.contains("popup-img") ||
            e.target.classList.contains("popUpSection")
        ) {
            this.container.style.display = "none";
        }
    }
}
const scroll = new ScrollEffect();

const gallery = new GalleryCarousel(document.querySelector(".gallery-wrapper"));
var galleryContainer = new PopupView("gallery");

let portfolioElements = document.querySelectorAll(".portfolio-thumb");
var portfolioContainer = new PopupView("portfolio");

/** About Parts Event */
var introPic = document.querySelectorAll(".intro-pic");
document.querySelectorAll(".intro-pic").forEach((e, i) => {
    var n = i;
    e.addEventListener("pointerdown", (ev) => {
        introPic.forEach((elem) => {
            elem.classList.remove("show");
        });
        ev.target.classList.add("show");
        $(".intro.content-wrapper").removeClass("show").addClass("hidden");
        $(".intro.content-wrapper").each((i, e) => {
            if (i == n) {
                $(e).removeClass("hidden").addClass("show");
            }
        });
    });
});

/** Navlink scroll correction */
document.querySelectorAll(".nav-link.scroll:not(.test)").forEach((el) => {
    el.addEventListener("click", async (e) => {
        e.preventDefault();
        let href = $(el).attr("href").replace(/#/g, "");
        scrolling.scrollById(href);
        svgdrag.close();
    });
});
