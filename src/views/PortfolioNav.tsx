interface portfolioNavProps {
    src: string;
    name: string;
    onClick: () => void;
    text: string;
}

export default function PortfolioNav({
    src,
    name,
    text,
    onClick,
}: portfolioNavProps) {
    return (
        <div className="item-wrapper" onClick={onClick}>
            <div className="item-img">
                <img src={src} alt="" />
            </div>
            <div className="itemText">{text}</div>
        </div>
    );
}
