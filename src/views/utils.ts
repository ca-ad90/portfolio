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

function setSectionProps(section: HTMLElement | null): SectionElement {
    if (section === null) return {} as SectionElement;
    Object.defineProperties(section, {
        height: {
            get: function (): number {
                let h = this.getBoundingClientRect().height;
                return h;
            },
            configurable: true,
        },
        top: {
            get: function (): number {
                let h = this.getBoundingClientRect().top;
                return h;
            },
            configurable: true,
        },
        bottom: {
            get: function (): number {
                let t = window.innerHeight - (this.top + this.height);
                return t;
            },
            configurable: true,
        },
        y: {
            get: function (): number {
                let h = this.getBoundingClientRect().y;
                return h;
            },
            configurable: true,
        },

        overflow: {
            get: function (): boolean {
                let offset = 200;
                return this.height + offset > window.innerHeight;
            },
            configurable: true,
        },
        offset: {
            get: function (): { top: number; bottom: number; gap: number } {
                let spaceLeft = window.innerHeight - this.height;
                let offsetTop = (spaceLeft / 2) * 0.9;
                let offsetBottom = (spaceLeft / 2) * 1.1;
                return {
                    top: offsetTop,
                    bottom: offsetBottom,
                    gap: window.innerHeight - this.height,
                };
            },
            configurable: true,
        },
        _index: {
            configurable: true,
        },
        index: {
            get(): number {
                return this._index;
            },
            set(n: number) {
                this._index = n;
            },
            configurable: true,
        },
    });

    return section as SectionElement;
}

function curve(x: number): number {
    //return animation timing curve
    return 0.5 * Math.cos(Math.PI * x - Math.PI) + 0.5;
}
export { setSectionProps, curve, type SectionElement };
