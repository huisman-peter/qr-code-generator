import "p-elements-core/dist/p-elements-core-modern.js";
import QRCodeStyling from "qr-code-styling";
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import css from "./qr.css?inline";
class PfzwQrCodeGenerator extends CustomElement {
    url = "https://pfzw.nl/";
    render = () => {
        return Maquette.h("div", null,
            Maquette.h("input", { type: "url", value: this.url, oninput: this.onDataChange }),
            Maquette.h("div", { id: "QRContainer", afterCreate: this.onCreateQRElement }),
            Maquette.h("button", { onclick: this.onDownloadButtonClick }, "Download QR code"));
    };
    onCreateQRElement = (n) => {
        this.qrCode = new QRCodeStyling(this.defaultStyling);
        this.qrCode.append(n);
    };
    onDataChange = (e) => {
        const htmlInput = e.target;
        this.url = htmlInput.value;
        console.log(this.url);
        this.defaultStyling = { ...this.defaultStyling, data: this.url };
        this.qrCode.update(this.defaultStyling);
    };
    onDownloadButtonClick = async () => {
        const defaultPath = this.url.split("//")[1].replaceAll("/", "-").replaceAll("?", "-").replaceAll(".", "-").replaceAll('/', "-");
        const path = await save({
            filters: [{
                    name: "QR code",
                    defaultPath,
                    extensions: ['svg']
                }]
        }).catch((e) => e);
        if (path instanceof Error || !path) {
            console.log(path);
            return;
        }
        var type = "application/svg+xml";
        var blob = new Blob([this.qrCode._svg.outerHTML.replace("<svg ", "<svg xmlns=\"http://www.w3.org/2000/svg\" ")], { type });
        const buffer = await blob.arrayBuffer();
        const contents = new Uint8Array(buffer);
        const saveResult = await writeBinaryFile({
            contents,
            path
        });
    };
    defaultStyling;
    qrCode;
    connectedCallback() {
        this.defaultStyling = {
            width: 1200,
            height: 1200,
            data: this.url,
            // margin: 10,
            qrOptions: {
                mode: "Byte",
                errorCorrectionLevel: "H",
            },
            imageOptions: {
                hideBackgroundDots: false,
                imageSize: 1,
                margin: 0,
            },
            dotsOptions: {
                type: "square",
                color: "#393a3c",
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            // image: this.logo,
            cornersSquareOptions: {
                type: "extra-rounded",
                color: "#404b96",
            },
            cornersDotOptions: {
                type: "square",
            },
        };
        const template = this.templateFromString(`
      <style>${css}</style>
      <div class="root"></div>`, true);
        this.shadowRoot.appendChild(template);
        const rootElement = this.shadowRoot.querySelector(".root");
        this.createProjector(rootElement, this.render);
    }
    static get observedAttributes() {
        return ["data"];
    }
}
customElements.define("pfzw-qr-code-generator", PfzwQrCodeGenerator);
