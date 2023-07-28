import { parse, type HTMLElement } from "node-html-parser";

export class PageParser {
    protected readonly dom: HTMLElement;

    constructor(pageSource: string) {
        this.dom = parse(pageSource);
    }
}