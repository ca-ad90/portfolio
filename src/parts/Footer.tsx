import { ForwardedRef, forwardRef } from "react";

interface FooterProps {
    name: string;
}
const Footer = forwardRef(function Footer(
    props: FooterProps,
    ref: ForwardedRef<HTMLDivElement>,
) {
    return (
        <div id={props.name} className="footer" ref={ref}>
            hej
        </div>
    );
});

export default Footer;
