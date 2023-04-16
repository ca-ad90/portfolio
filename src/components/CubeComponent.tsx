function PortfolioCube() {





    const rangeGroup = document.querySelectorAll("#settings .inp-range");
    const box = document.querySelector(".box");
    const scalebox = document.querySelector(".scalebox");
    const navBtn = document.querySelectorAll(".nav-btn");
    const frontSide = "rotate3d(0,0,0,0deg)";
    const topSide = "rotate3d(1,0,0,-90deg)";
    const leftSide = "rotate3d(0,1,0,-90deg)";
    const rightSide = "rotate3d(0,1,0,90deg)";
    const bottomSide = "rotate3d(1,0,0,90deg)";
    const backSide = "rotate3d(0,1,0,180deg)";
    const newRotatation = "";
    const currentSide = "front";
    const aniTimeOut;

    /* navBtn.forEach((e) => {
      e.addEventListener("click", function (event) {
        var btn = event.target;
        var side = btn.classList[1].replace("nav-", "").trim();
        document.querySelectorAll(".box-side").forEach((e) => {});
        console.log(side);
        rotate2(side);
      });
    }); */
    interface rotate3 {
        timeOut:number,
        stop:boolean,
        box:HTMLDivElement | null,
        btn:NodeListOf<HTMLDivElement>
        currentSide:string,
        nextSide:string,
        oldSide:string | number[],
        state:string,
        newSide:string | string[],
        time:number
        ms:number
        startTime:Date
        still:()=>void

    }

type side = string

    class rotate3 {
        constructor(box:string, controler:string) {
            this.box = document.querySelector(box);
            if(this.box === null){
            throw (new Error("BAJS"))}
            this.timeOut = 0
            this.stop = false;

            this.btn = document.querySelectorAll(controler);
            this.currentSide = "front";
            this.nextSide = "";
            this.oldSide = this.box.style.transform || "rotate3d(0,0,0,0deg)";
            this.state = "";
            this.newSide = ""
            this.time = 1;
            this.ms = 10;
            this.startTime = new Date()
            this.btn.forEach((e) => {
                e.addEventListener("click", (event) => {

                    var btn = event.target as HTMLDivElement;
                    if(!btn) return
                    var side = btn.classList[1].replace("nav-", "").trim();
                    this.btn.forEach((e) => {
                        e.classList.remove("btn-selected");
                        if (e.classList.value.indexOf(side) > 0) {
                            e.classList.add("btn-selected");
                        }
                    });

                    console.log(side);
                    this.still()
                });
            });
        }
        rotate(side:side) {
            this.stop = false;
            var newSide = this.getNewSide(side);
            var oldSide = this.startSide;
            if(oldSide==null)return
            var diff = [
                newSide[0] - oldSide[0],
                newSide[1] - oldSide[1],
                newSide[2] - oldSide[2],
                newSide[3] - oldSide[3],
            ];
            this.startTime = new Date();
            let now = [...oldSide];
            this.animation(now, diff, this.time, this.ms);
        }
        get startSide() {
            if(!this.box)return
            let oldSide = this.box.style.transform || "rotate3d(0,0,0,0deg)";
            oldSide = oldSide.substr(
                oldSide.indexOf("rotate3d"),
            );
            let oldArr = oldSide
                .replace(/rotate3d\(|deg\)/g, "")
                .split(",")
                .map((e) => Number(e));
            this.oldSide = oldArr
            return this.oldSide;
        }
        getNewSide(side:side) {
            this.nextSide = side;
            switch (side) {
                case "front":
                    this.newSide = "scale(0.9) rotate3d(0,0,0,0deg)";
                    break;
                case "top":
                    this.newSide = "scale(0.9) rotate3d(1,0,0,-90deg)";
                    break;
                case "left":
                    this.newSide = "scale(0.9) rotate3d(0,1,0,-90deg)";
                    break;
                case "right":
                    this.newSide = "scale(0.9) rotate3d(0,1,0,90deg)";
                    break;
                case "bottom":
                    this.newSide = "scale(0.9) rotate3d(1,0,0,90deg)";
                    break;
                case "back":
                    this.newSide = "scale(0.9) rotate3d(0,1,0,180deg)";
                    break;
            }
            var newSide = this.newSide.substr(this.newSide.indexOf("rotate3d"));
            newSide = newSide
                .replace(/rotate3d\(|deg\)/g, "")
                .split(",")
                .map((e) => Number(e));
            return newSide;
        }
        shadow(current) {
            var sides = {
                front: [0, 0, 0, 0],
                top: [1, 0, 0, -90],
                left: [0, 1, 0, -90],
                right: [0, 1, 0, 90],
                bottom: [1, 0, 0, 90],
                back: [0, 1, 0, 180],
            };
            for (let side in sides) {
                var s = sides[side];

                let degDiff = Math.abs(
                    ((Math.abs(s[3]) - 100) * (s[3] / Math.abs(s[3])) -
                        current[3]) /
                        100,
                );
                if (s[3] == current[3]) {
                    let v = s[0] < s[1] ? 1 : 0;
                    degDiff = Math.abs((s[3] * current[v]) / s[3]);
                }

                if (s[3] == 0) {
                    degDiff = Math.abs((100 + s[3] - current[3]) / 100);
                }
                degDiff = degDiff > 1 ? 2 - degDiff : degDiff;
                var l = degDiff * 100;

                box.querySelector(".box-" + side).style.backgroundColor =
                    "hsl(0, 0%, " + (l + 10) + "%)";
            }
        }
        animation(start, diff, time, ms) {
            if (this.stop) {
                clearTimeout(this.timeOut);
                return;
            }
            var trans = new Array(4).fill("");
            this.currentTime = new Date();
            console.log(this);
            var part =
                ((this.currentTime - this.startTime) / (time * 1000)) * 100;
            console.log("a", part);
            var trans = start.map((e, i) => {
                return (
                    start[i] +
                    ((diff[i] / 2) * Math.sin((Math.PI / 100) * (part - 50)) +
                        diff[i] / 2)
                );
            });

            var scale =
                0.9 *
                (1 - (0.2 * Math.sin((Math.PI / 50) * (part - 25)) + 0.2));

            var transform = `scale(${scale}) rotate3d(${trans[0]},${trans[1]},${trans[2]},${trans[3]}deg)`;
            this.state = transform;
            box.style.transform = transform;

            if (part < 100) {
                this.shadow(trans);
                this.timeOut = setTimeout(
                    this.animation.bind(this),
                    10,
                    start,
                    diff,
                    this.time,
                    ms,
                );
            } else {
                box.childNodes.forEach((e) => {
                    if (e.nodeName == "DIV") {
                        e.childNodes.forEach((el) => {
                            if (el.nodeName == "DIV") {
                                console.log(el.nodeName);
                                el.style.opacity = 1 + "";
                            }
                        });
                    }
                });
                clearTimeout(this.timeOut);
                scalebox.style.animation = "stop 0.01s linear";
                box.style.transform = this.newSide;
                this.currentSide = this.nextSide;
                this.nextSide = "";
                this.newSide = "";
            }
        }
        function still() {
            this.stop = true;
            clearTimeout(this.timeOut);
        }
    }

    var rotBox = new rotate3(".box", ".nav-btn");

    return (
        <div id="page">
            <div className="navbar">
                <div className="nav-btn nav-front">Front</div>
                <div className="nav-btn nav-top btn-selected">Top</div>
                <div className="nav-btn nav-left">Left</div>
                <div className="nav-btn nav-right">Right</div>
                <div className="nav-btn nav-bottom">Bottom</div>
                <div className="nav-btn nav-back">Back</div>
            </div>
            <div className="wrapper">
                <div className="scalebox">
                    <div className="box">
                        <div className="box-side box-top">
                            <div className="content">TOP</div>
                        </div>
                        <div className="box-side box-left">
                            <div className="content">LEFT</div>
                        </div>
                        <div className="box-side box-right">
                            <div className="content">RIGHT</div>
                        </div>
                        <div className="box-side box-back">
                            <div className="content">BACK</div>
                        </div>
                        <div className="box-side box-bottom">
                            <div className="content">BOTTOM</div>
                        </div>
                        <div className="box-side box-front">
                            <div className="content">FRONT</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
