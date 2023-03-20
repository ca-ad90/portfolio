class svgDrag2 {
    constructor(header, pos) {
        this.wrapper = header;
        this.blocker = document.getElementById("navbar-blocker");
        this.content = header.querySelector(".navbar-content");
        this.svg = header.querySelector("svg.navbar-svg");
        this.navbar = this.svg.querySelector("path");
        this.revertTime = null;
        this.request;
        this.reqOpen;
        this.reqClose;
        this.revertResolve = () => { };
        this.openResolve = () => { };
        this.closeResolve = () => { };

        this.timeout;
        this.isDragging = false;
        this.clickEvent = false;
        this.type = "drag";
        this.dragLen;
        this.mouse = {
            x: 0,
            y: 0,
        };
        this._path = [
            ["M", 0, 0],
            ["l", 100, 0],
            ["l", 0, 10],
            ["q", 0, 0, -100, 0, "z"],
        ];
        this._circle = {
            top: 0,
            left: 0,
            size: 0,
        };
        this.cStart = {
            x: 0,
            y: 0,
        };
        this.path = {};
        var l = 1;
        this.pos = pos;
        this._path.forEach((e, i) => {
            var start = i;
            var prop = e[0];
            if (prop == "l") {
                prop = prop + l;
                l++;
            }
            Object.defineProperty(this.path, prop, {
                get: () => {
                    let l = [this._path[i][1], this._path[i][2]];
                    return l;
                },
                set: (y) => {
                    this._path[i] = [e[0], ...y];
                    this.update();
                },
            });
        });
        this.size = {
            close: 0,
            open: 0.8,
            offset: 120,
        };
        this.navBtn = this.wrapper.querySelector(".navbar-btn");

        window.addEventListener("touchmove", this.mousemove.bind(this));
        window.addEventListener("touchend", this.mouseUp.bind(this));

        this.navBtn.addEventListener("pointerdown", this.mouseDown.bind(this));
        this.content.addEventListener("pointerdown", this.mouseDown.bind(this));
        this.navbar.addEventListener("pointerdown", this.mouseDown.bind(this));

        window.addEventListener("mousemove", this.mousemove.bind(this));

        window.addEventListener("mouseup", this.mouseUp.bind(this));

        window.addEventListener("resize", this.init.bind(this));

        this.containers = [
            this.wrapper,
            this.blocker,
            this.content,
            this.svg,
            this.navBtn,
        ];

        this.init();
    }

    get win() {
        var win = {
            width: Number(window.innerWidth.toFixed(2)),
            height: Number(window.innerHeight.toFixed(2)),
        };

        if (this.pos == "left") {
            win = {
                width: Number(window.innerHeight.toFixed(2)),
                height: Number(window.innerWidth.toFixed(2)),
            };
        }

        win.min = win.width < win.height ? win.width : win.height;
        win.max = win.width > win.height ? win.width : win.height;
        return win;
    }
    get bar() {
        var bar = {
            height: this.navbar.getBoundingClientRect().height,
            width: this.navbar.getBoundingClientRect().width,
        };
        if (this.pos == "left") {
            bar = {
                width: this.navbar.getBoundingClientRect().height,
                height: this.navbar.getBoundingClientRect().width,
            };
        }
        return bar;
    }
    get svgSize() {
        var svgSize = {
            height: this.navbar.getBoundingClientRect().height,
            width: this.svg.getBoundingClientRect().width,
        };
        if (this.pos == "left") {
            svgSize = {
                width: this.svg.getBoundingClientRect().height,
                height: this.navbar.getBoundingClientRect().width,
            };
        }
        return svgSize;
    }
    get qx() {
        if (this.pos == "left") {
            return this._path[3][2];
        } else {
            return this._path[3][1];
        }
    }
    get qy() {
        if (this.pos == "left" || this.pos == "right") {
            return this._path[3][1];
        } else {
            return this._path[3][2];
        }
    }
    set svgHeight(height) {
        if (this.pos == "left") {
            this.svg.style.width = height;
            this.svg.parentElement.style.width = height;
        } else {
            this.svg.style.height = height;
        }
    }
    set svgWidth(width) {
        if (this.pos == "left") {
            this.svg.style.height = width;
            this.svg.parentElement.style.height = width;
        } else {
            this.svg.style.width = width;
            this.svg.parentElement.style.width = width;
        }
    }
    set circle({ x, y, size }) {
        let _size = size ? size : this._circle.size;
        let _x = x || x == 0 ? x : this._circle.left;
        let _y = y || y == 0 ? y : this._circle.top;

        if (isNaN(_x) || isNaN(_y)) {
        }
        this._circle.left = _x;
        this._circle.top = 0;
        this._circle.size = _size;
        if (this.pos == "left") {
            this._circle.left = 0;
            this._circle.top = _x;
        }
        this.update();
    }
    get circle() {
        var c = {
            x: this._circle.left,
            y: this._circle.top,
            size: this._circle.size,
            startX: this.cStart.x,
            startY: this.cStart.y,
        };
        if (this.pos == "left") {
            var c = {
                y: this._circle.left,
                x: this._circle.top,
                size: this._circle.size,
                startX: this.cStart.y,
                startY: this.cStart.x,
            };
        }
        return c;
    }

    //Path calculators
    m(e) {
        var m = {
            x:
                e.clientX < 0
                    ? 0
                    : e.clientX > this.win.width
                        ? this.win.width
                        : e.clientX,
            y:
                e.clientY < 0
                    ? 0
                    : e.clientY > this.win.height
                        ? this.win.height
                        : e.clientY,
        };

        if (this.pos == "left") {
            m = {
                y:
                    e.clientX < 0
                        ? 0
                        : e.clientX > this.win.width
                            ? this.win.width
                            : e.clientX,
                x:
                    e.clientY < 0
                        ? 0
                        : e.clientY > this.win.height
                            ? this.win.height
                            : e.clientY,
            };
        }
        return m;
    }
    lxy(x, y) {
        if (this.pos == "top") {
            return [x, y];
        } else if (this.pos == "left") {
            return [y, x];
        }
    }
    qh({ hx, hy, x, y }) {
        let _hx = hx || hx == 0 ? hx : this._path[3][1];
        let _hy = hy || hy == 0 ? hy : this._path[3][2];

        let _x = x || x == 0 ? x : this._path[3][3];
        let _y = y || y == 0 ? y : this._path[3][4];

        if (this.pos == "left") {
            this._path[3] = [
                this._path[3][0],
                _hy,
                _hx,
                _x,
                _y,
                this._path[3][5],
            ];
        } else {
            this._path[3] = [
                this._path[3][0],
                _hx,
                _hy,
                _x,
                _y,
                this._path[3][5],
            ];
        }

        this.update();
    }

    /*
    DOM Controlers
     */

    init() {
        this.pos = "top";
        var h = this.size.close;
        if (this.isOpen) {
            h = this.win.height * this.size.open;
        }
        this.path.M = [0, 0];
        this.path.l1 = this.lxy(this.win.width, 0);
        this.path.l2 = this.lxy(0, h);
        this.qh({
            hx: -this.win.width / 2,
            hy: this.size.offset,
            x: this.lxy(-this.win.width, -h)[0],
            y: this.lxy(-this.win.width, -h)[1],
        });
        this.svgWidth = "100%";

        if (this.pos == "left") {
            this.wrapper.classList.remove("top");
            this.wrapper.classList.add("left");
        } else {
            this.wrapper.classList.remove("left");
            this.wrapper.classList.add("top");
        }

        this.circle = {
            x: this.svgSize.width / 2 - this.circle.size / 2,
            y: 0,
            size: this.bar.height,
        };
        this.wrapper.style.height = this.bar.height + "px";
    }
    update() {
        this.navbar.setAttribute("d", this._path.join(" ").replace(/,/g, " "));
        for (let attr in this._circle) {
            if (isNaN(this._circle[attr])) {
            }
            if (attr == "size") {
            }
        }
    }

    /*
    EVENT HANDLERS
    */

    mouseDown(el) {
        // reset animation
        this.cancelRevert();

        // find ClickEvent (open on click)
        if (
            el.target == this.navBtn ||
            $(this.navBtn).find(el.target).length > 0
        ) {
            this.clickEvent = true;
            let hy = this.isOpen ? -100 : 100;
            this.qh({
                hy: hy,
            });
        } else {
            this.clickEvent = false;
        }
        if (el.target == this.wrapper || $(this.wrapper).find(el.target)) {
            const event = el.touches ? el.touches[0] : el;


            //Start Dragging
            this.isDragging = true;

            this.request = null;
            this.cancelOpen();
            this.reqOpen = null;
            this.cancelClose();
            this.reqClose = null;

            //get mouse starting position
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;


            this.cStart.x = this._circle.left;
            this.cStart.y = this._circle.top;

        } else {
        }
    }
    mousemove(el) {
        if (this.isDragging) {
            this.navbar.classList.remove("revert");

            const e = el.touches ? el.touches[0] : el;
            var moveX = Number(this.m(e).x.toFixed(2)) - this.win.width;
            var moveY = this.m(e).y - this.mouse.y;
            if (this.clickEvent) {
                moveY = this.isOpen
                    ? moveY - (100 - this.size.offset)
                    : moveY + (100 - this.size.offset);
            }
            this.qh({
                hx: moveX,
                hy: moveY + this.size.offset,
            });
            this.svgHeight = this.bar.height + "px";
            this.wrapper.style.height = this.bar.height + "px";
            this.dragLen = moveY;
        }
    }
    mouseUp(el) {
        if (
            (el.target == this.navBtn ||
                $(this.navBtn).find(el.target).length > 0) &&
            this.clickEvent
        ) {
            this.clickEvent = false;

            if (this.isOpen) {
                this.isDragging = false;
                this.close();
            } else {
                this.isDragging = false;
                this.open();
            }
        } else if (this.isDragging) {
            const e = el.touches ? el.touches[0] : el;
            if (this.type == "drag") {
                this.isDragging = false;
                if (
                    Math.abs(this.qy) > this.win.height * 0.1 &&
                    Math.abs(this.dragLen) > 150
                ) {
                    if (!this.isOpen) {
                        this.open();
                    } else if (this.isOpen) {
                        this.close();
                    }
                } else {
                    this.revert();
                }
            } else {
                this.revert();
            }
        }
    }

    /*
    ANIMATIONS
    */
    async open() {
        console.log("open", this.isd)
        this.cancelRevert();
        this.isDragging = false;
        this.isOpen = true;
        if (this.clickEvent) {
            this.qh({
                hy: this.win.height * 0.2 + this.size.offset,
            });
        } else {
            var ani = new Promise(async (res) => {
                this.cancelOpen = res;
                document.body.style.overflow = "hidden";
                this.blocker.style.height = this.win.height + "px";
                this.blocker.style.width = this.win.width + "px";
                this.revert();
                var to = this.win.height * 0.75;
                var openTime = null;
                var openMs = 500;

                var openLoop = (timestamp) => {
                    if (!openTime) {
                        openTime = timestamp;
                    }
                    let curve = (x) =>
                        0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
                    let elapsed = timestamp - openTime;
                    let part = elapsed / openMs;
                    let pos = Math.min(to, to * curve(part));
                    this.path.l2 = this.lxy(0, pos);
                    this.svgHeight = this.bar.height + "px";
                    this.wrapper.style.height = this.bar.height + 5 + "px";
                    if (elapsed > openMs || this.path.l2[1] == to) {
                        this.cancelOpen();
                        this.reqOpen = null;
                        this.path.l2 = this.lxy(0, to);
                        res(true);
                    } else {
                        this.reqOpen = window.requestAnimationFrame(
                            openLoop.bind(this)
                        );
                    }
                };

                this.reqOpen = window.requestAnimationFrame(
                    openLoop.bind(this)
                );
            }).then(() => {
                this.containers.forEach((e) => {
                    e.classList.remove("closed");
                    e.classList.add("open");
                });
            });

            this.circle = {
                y: this.win.height * 0.75,
                x: this.svgSize.width / 2 - this.size / 2,
            };
        }


    }
    async close() {
        if (!this.isOpen) {
            return;
        }
        this.isDragging = false;
        this.isOpen = false;
        var ani = new Promise(async (res) => {
            this.cancelClose = res;
            document.body.style.overflow = "auto";
            this.blocker.style.display = "none";
            this.revert();
            var to = 0;
            var closeTime = null;
            var closeMs = 500;
            var closeLoop = (timestamp) => {
                if (!closeTime) {
                    closeTime = timestamp;
                }
                let curve = (x) => 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
                let elapsed = timestamp - closeTime;
                let part = elapsed / closeMs;
                let pos = Math.max(
                    to,
                    this.win.height * 0.75 -
                    this.win.height * 0.75 * curve(part)
                );
                this.path.l2 = this.lxy(0, pos);
                this.svgHeight = this.bar.height + "px";
                this.wrapper.style.height = this.bar.height + 5 + "px";
                if (elapsed > closeMs || this.path.l2[1] == to) {


                    this.path.l2 = this.lxy(0, 0);
                    this.cancelClose(true);
                } else {
                    this.reqClose = window.requestAnimationFrame(
                        closeLoop.bind(this)
                    );
                }
            };
            this.isOpen = false;
            this.cancelOpen();
            this.reqClose = window.requestAnimationFrame(closeLoop.bind(this));
        }).then(() => {
            this.containers.forEach((e) => {
                e.classList.add("closed");
                e.classList.remove("open");
            });
        });

        this.circle = {
            y: 0,
            x: this.svgSize.width / 2 - this.circle.height / 2,
        };
    }
    async revert() {
        this.navbar.style.transition = "0.05s";
        this.navbar.classList.add("revert");
        this.stopAnimation = false;
        var revPart = 0;
        var elapsed = 0;
        var revPartSum = 0;
        var next = this.qy;
        var time = 250;
        var xTime = null;
        var xMs = 1000;
        var preState;
        var len;
        var xPos = this.qx;
        var xLen = -this.bar.width / 2 - this.qx;
        this.revertTime = 0;
        var p = new Promise(async (res) => {
            this.revertResolve = res;
            const loop = async (timestamp) => {
                if (!this.revertTime) {
                    this.revertTime = timestamp;
                    xTime = timestamp;
                    preState = next;
                    next = (next / 1.4) * -1;
                    revPart = 0;
                }

                elapsed = timestamp - this.revertTime;
                if (Math.floor(elapsed / time) > revPart) {
                    revPart = Math.floor(elapsed / time);
                    preState = next;
                    next = (next / 2) * -1;
                }
                len = preState - next;
                let curve = (x) => 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
                let del = (elapsed - time * revPart) / time;
                let pos = preState - len * curve(del);
                let xdel = elapsed / xMs;
                let xpos = Math.max(
                    -this.bar.width / 2,
                    xPos + xLen * curve(xdel)
                );

                this.qh({
                    hx: xpos,
                    hy: pos + this.size.offset + 10,
                });
                this.svgHeight = this.bar.height + "px";
                this.wrapper.style.height = this.bar.height + 5 + "px";

                if (revPart > 10) {
                    this.qh({
                        hx: -this.bar.width / 2,
                        hy: this.size.offset,
                    });
                    this.svgHeight = this.bar.height + "px";
                    this.wrapper.style.height = this.bar.height + 5 + "px";
                    this.revertTime = null;
                    window.cancelAnimationFrame(this.request);
                    this.request = null;
                    this.navbar.style.transition = "0s";
                    this.revertResolve();
                } else {
                    this.update();
                    this.request = window.requestAnimationFrame(
                        loop.bind(this)
                    );
                }
            };
            this.request = window.requestAnimationFrame(loop.bind(this));
        }).then(() => {
            this.revertTime = 0;
            this.navbar.style.transition = "0s";
        });
    }
    cancelRevert() {
        window.cancelAnimationFrame(this.request);
        this.request = null;
        this.revertResolve();
    }
    cancelOpen() {
        window.cancelAnimationFrame(this.reqOpen);
        this.reqOpen = null;
        this.openResolve();
    }
    cancelClose() {
        window.cancelAnimationFrame(this.reqClose);
        this.reqClose = null;
        this.closeResolve();
    }
}
const dragContainer = document.querySelector(".navbar-wrapper");
var svgdrag = new svgDrag2(dragContainer, "left");
dragContainer.querySelectorAll(".nav-link").forEach((e) => {
    e.addEventListener("click", function (e) {
        svgdrag.close();
    });
});
doc.addEventListener("scroll", showMenu);
window.addEventListener("resize", showMenu);

function showMenu(e) {
    if (window.innerWidth <= 500) {
        svgdrag.svgHeight = "60px";
        $(".navbar-wrapper").css("display", "flex").css("height", "65px");
        if ($(".navbar-wrapper").css("display") == "none") {
            $(".navbar-wrapper")
                .css("display", "flex")
                .css("height", "65px")
                .hide()
                .fadeIn("slow");
        }
        svgdrag.close();
        return;
    }

    if (
        doc.scrollTop > window.innerHeight / 3 &&
        $(".navbar-wrapper").css("display") == "none"
    ) {
        svgdrag.svgHeight = "60px";
        $(".navbar-wrapper")
            .css("display", "flex")
            .css("height", "65px")
            .hide()
            .fadeIn("slow");
    } else if (
        doc.scrollTop < window.innerHeight / 3 &&
        $(".navbar-wrapper").css("display") != "none"
    ) {
        $(".navbar-wrapper").fadeOut("slow");
        svgdrag.close();
    }
}
