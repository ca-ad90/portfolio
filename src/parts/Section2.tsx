import { KeyObject } from "crypto";
import { ReactNode, ReactElement, useState, useEffect } from "react";
const info = [
    {
        title: "Carl Adrian",
        descr: "Digital och analog kreatör och designer",
        text: `Jag är grafisk och front-end desinger. Behöver ni en
    grafisk profil, en websida och grafiskt material som
    knyter jag allt samman. En bra hemsida är mer än bara
    bra kod, bra design och tilltalande innehåll precis lika
    viktigt som koden som bygger upplevelsen för era kunder
    och besökare!`,
        name: "about",
    },
    {
        title: "Kreativitet och Design",
        descr: "Bra desing ska vara användbart",
        text: `Jag är grafisk och front-end desinger. Behöver ni en
    grafisk profil, en websida och grafiskt material som
    knyter jag allt samman. En bra hemsida är mer än bara
    bra kod, bra design och tilltalande innehåll precis lika
    viktigt som koden som bygger upplevelsen för era kunder
    och besökare!`,
        name: "artwork",
    },
    {
        title: "Funktion och kod",
        descr: "En hemsida är ett bestående intryck",
        text: `En hemsida är ofta det första intrycket som stannar.
    Användarvänlighet, design och rätt information på rätt
    plats! För att få en personlighemsida så bygger jag
    konceptet från grunden utan mallar för att er hemsida skall
    spegla just er! Har ni redan ett back-end system som ni
    skall koppla till hemsidan? Inga problem!`,
        name: "portfolio",
    },
];
interface SectionProps {
    name: string;
    descr: string;
    children: React.ReactNode | Array<React.ReactNode>;
}

interface PortfolioProps {}
interface GalleryProps {
    data: Array<{
        title: string;
        descr: string;
    }>;
}

function AboutSection(props: {
    data: Array<{
        title: string;
        descr: string;
        text: string;
        name: string;
    }>;
}): ReactElement {
    const [part, setPart] = useState("about");
    return (
        <>
            <div className="intro-content-left">
                {props.data.map((e, i) => (
                    <div
                        className={
                            "intro-" +
                            e.name +
                            " content-wrapper " +
                            (part == e.name ? "show" : "hidden")
                        }
                        key={i + e.title}>
                        <section className="sub-section">
                            <h3>{e.title}</h3>
                            <p className="ingress">{e.descr}</p>
                            <p className="text-content">{e.text}</p>
                        </section>
                    </div>
                ))}
            </div>

            <div className="intro-content-right parralax">
                {props.data.map((e, i) => (
                    <div
                        key={e.name + i}
                        className={
                            "intro-pic " +
                            e.name +
                            " parralax " +
                            (part == e.name ? "show" : "hidden")
                        }
                        onClick={() => setPart(e.name)}></div>
                ))}
            </div>
        </>
    );
}

function PortfolioSetion(props: PortfolioProps): ReactElement {
    const [items, setItems] = useState([]);
    useEffect(() => {
        fetch("../portfolioSettings.json")
            .then((e) => e.json())
            .then((data) => {
                console.log(data);
            });
    });

    function thumbNail() {
        return (
            <div className="thumb-container">
                <div
                    className="thumb portfolio-thumb"
                    data-setting="portfolio"
                    data-item="0">
                    <img src="" alt="" />
                </div>
                <p className="portfolio-text ingress">Bohemian-bear</p>
            </div>
        );
    }
    return <div className="thumb-wrapper"></div>;
}

function GallerySection(props: GalleryProps): ReactElement {
    return <div></div>;
}

function Section(props: SectionProps) {
    return (
        <section id={"section-" + props.name}>
            <h2 className="section-header">
                {props.name.substring(0, 1).toUpperCase() +
                    props.name.substring(1)}
            </h2>
            <p className="section-pre">{props.descr ? props.descr : ""}</p>
            <div className="section-wrapper">{props.children}</div>
        </section>
    );
}

const Sections = [
    {
        name: "about",
        descr: "abountaraer",
        content: AboutSection,
        props: [
            {
                title: "Carl Adrian",
                descr: "Digital och analog kreatör och designer",
                text: `Jag är grafisk och front-end desinger. Behöver ni en
            grafisk profil, en websida och grafiskt material som
            knyter jag allt samman. En bra hemsida är mer än bara
            bra kod, bra design och tilltalande innehåll precis lika
            viktigt som koden som bygger upplevelsen för era kunder
            och besökare!`,
                name: "about",
            },
            {
                title: "Kreativitet och Design",
                descr: "Bra desing ska vara användbart",
                text: `Jag är grafisk och front-end desinger. Behöver ni en
            grafisk profil, en websida och grafiskt material som
            knyter jag allt samman. En bra hemsida är mer än bara
            bra kod, bra design och tilltalande innehåll precis lika
            viktigt som koden som bygger upplevelsen för era kunder
            och besökare!`,
                name: "artwork",
            },
            {
                title: "Funktion och kod",
                descr: "En hemsida är ett bestående intryck",
                text: `En hemsida är ofta det första intrycket som stannar.
            Användarvänlighet, design och rätt information på rätt
            plats! För att få en personlighemsida så bygger jag
            konceptet från grunden utan mallar för att er hemsida skall
            spegla just er! Har ni redan ett back-end system som ni
            skall koppla till hemsidan? Inga problem!`,
                name: "portfolio",
            },
        ],
    },
    {
        name: "portfolio",
        descr: "abountaraer",
        content: PortfolioSetion,
        props: ["info"],
    },
    {
        name: "gallery",
        descr: "titt på mitt fina galleri!",
        content: GallerySection,
        props: [{ title: "hejsan", descr: "BB" }],
    },
];
export { Sections, Section, info };
