import { forwardRef } from "react";

interface FooterProps {
    name: string;
}
const Footer = forwardRef(function Footer(props: FooterProps, ref: any) {
    return <div id={props.name} className="footer" ref={ref}></div>;
});

export default Footer;
