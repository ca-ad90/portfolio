import {
    motion,
    motionValue,
    transform,
    useMotionValue,
    useMotionValueEvent,
    useScroll,
    useTime,
    useTransform,
} from "framer-motion";
import { DocContext } from "../docContext";
import {
    useContext,
    useRef,
    useState,
    MutableRefObject,
    Children,
    ReactNode,
} from "react";
interface PortfoolioRowProps {
    title: string;
    index: number;
    motionContainer: MutableRefObject<HTMLDivElement | null>;
    onClick: (val: number) => void;
    trigger: (val: number) => void;
    children: ReactNode;
}
function useAlign(): [boolean, (val?: boolean | undefined) => void] {
    const [align, setAlign] = useState(false);
    function toggleAlign(val?: boolean | undefined) {
        let newAlign = val === undefined ? !align : val;
        setAlign(newAlign);
    }
    return [align, toggleAlign];
}
export default function PortfolioRow({
    title,
    motionContainer,
    index,
    onClick,
    trigger,
    children,
}: PortfoolioRowProps) {
    const [getX, setX] = useState(0);
    let y = ["start start", "start start"];
    const { doc, setDoc } = useContext(DocContext);
    const row = useRef<HTMLElement | null>(null);
    const { scrollX } = useScroll({
        container: motionContainer,
        target: row,

        offset: ["start end", "end start"],
    });
    const trans = transform([0, 0.5, 1], [0.5, 1, 0.5]);

    let [align, toggleAlign] = useAlign();

    useMotionValueEvent(scrollX, "change", (latest) => {
        let box = motionContainer.current?.getBoundingClientRect();
        let target = row.current?.getBoundingClientRect();
        if (row.current && box && target) {
            let part =
                (row.current?.offsetLeft -
                    latest -
                    box?.width +
                    target?.width / 2) /
                -box?.width;

            let nX = Math.max(Math.min(part, 1), 0);
            setX(nX);
            let i = index;
            if (index == 1) {
                console.log(nX);
            }

            if (nX < 0.7 && nX > 0.3) {
                if (!align) {
                    if (motionContainer.current === null) return;
                    console.log("ALIGN");
                    let sx = nX > 0.5 ? -2 : 2;

                    toggleAlign();
                }
            } else {
                toggleAlign(false);
            }
        }
    });
    function Clicker() {
        let box = motionContainer.current?.getBoundingClientRect();
        let target = row.current?.getBoundingClientRect();
        if (
            motionContainer.current &&
            row.current &&
            target?.width &&
            box?.width
        ) {
            motionContainer.current.scrollTo({
                behavior: "smooth",
                left:
                    row.current?.offsetLeft + target.width / 2 - box?.width / 2,
            });
            onClick(index + 1);
        }
    }

    return (
        <div
            className={"portfolio-row" + " " + title}
            ref={(el) => (row.current = el)}>
            <motion.div
                style={{ opacity: trans(getX), scale: trans(getX) }}
                onClick={Clicker}>
                {children}
            </motion.div>
        </div>
    );
}
