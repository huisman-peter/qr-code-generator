/// <reference types="p-elements-core" />

declare namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
}

declare module "*.css?inline";

declare const Maquette: {h: H};

