import { doUntilMouseUp } from "../events/until_mouseup.js";
import { rgbaColorContrast } from "../functions/colorContrast.js";
import { UI_clamp } from "../functions/ui_clamp.js";
import { Element, reactive, element } from "@lume/element";
import { html } from "@lume/element/dist/html.js";

@element("draggable-window")
export class DraggableWindow extends Element {
    @reactive text: string = "";
    @reactive clickCallback: (box: HTMLElement) => void = () => {};
    @reactive closeCallback: (box: HTMLElement) => void = () => {};
    @reactive color: string = "";
    @reactive barContent?: HTMLElement;

    box?: HTMLDivElement;
    bar?: HTMLDivElement;

    get root() {
        return this;
    }

    template = () => {
        return html`
            <div
                class="window show"
                ref=${(el: HTMLDivElement) => (this.box = el)}
                onmousedown=${() => this.clickCallback(this.box!)}
            >
                <div
                    class="draggable-window-bar"
                    ref=${(el: HTMLDivElement) => (this.bar = el)}
                >
                    ${() => this.text}
                    <button class="exit-button" onclick=${this.closeBox}>
                        x
                    </button>
                    ${this.barContent || ""}
                </div>
                <div class="contentBox"></div>
            </div>
        `;
    };

    css = /* css */ `
        /* .window {
            left: 50vw;
            top: 50vh;
        } */

        .draggable-window-bar {
            backgroundColor: ${this.color || "#555"};
            color: ${rgbaColorContrast(this.color || "#555")};
        }
    `;

    closeBox = () => this.closeCallback(this.box!);

    connectedCallback() {
        super.connectedCallback();

        addDragFunction(this.bar!, this.box!, this.clickCallback);
    }

    set(opts: Partial<DraggableWindowOptions>): this {
        Object.assign(this, opts);
        return this;
    }
}

type DraggableWindowOptions = {
    text: string;
    clickCallback: (box: HTMLElement) => void;
    closeCallback: (box: HTMLElement) => void;
    color: string;
    barContent?: HTMLElement;
};

export function createDraggableWindow(opts: DraggableWindowOptions) {
    return new DraggableWindow().set(opts);
}

// export function createDraggableWindow({
//     text,
//     clickCallback,
//     closeCallback,
//     color,
//     barContent,
// }: DraggableWindowOptions) {
//     const box = E("div", { className: "window show" });

//     box.style.left = "50vw";
//     box.style.top = "50vh";

//     const bar = E("div", {
//         text: text + " ",
//         className: "draggable-window-bar",
//     });
//     const exitBtn = E("button", { text: "x", className: "exit-button" });

//     bar.style.backgroundColor = color || "#555";
//     bar.style.color = rgbaColorContrast(color || "#555");

//     box.appendChild(bar);

//     if (barContent) bar.append(barContent);

//     bar.appendChild(exitBtn);

//     const closeBox = () => closeCallback(box);
//     exitBtn.onclick = closeBox;

//     addDragFunction(bar, box, clickCallback);

//     // Let the window be displayed if someone clicks on it.
//     box.onmousedown = clickCallback.bind(null, box);

//     box.appendChild(E("div")); // content box

//     return box;
// }

function addDragFunction(
    bar: HTMLElement,
    box: HTMLElement,
    clickCallback: Function
) {
    const state = { coords: [0] };

    bar.onmousedown = doUntilMouseUp(mousemove, { mousedown });

    function mousedown(e: MouseEvent) {
        state.coords = [
            e.clientX,
            e.clientY,
            box.offsetLeft + box.offsetWidth / 2,
            box.offsetTop + box.offsetHeight / 2,
        ];

        clickCallback(box);
    }

    function mousemove(e: MouseEvent) {
        const [x, y, bx, by] = state.coords;
        UI_clamp(e.clientX + bx - x, e.clientY + by - y, box, document.body, {
            disableClamp: 2,
        });
    }
}
