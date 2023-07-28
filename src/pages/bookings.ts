import { HTMLElement } from 'node-html-parser';
import { PageParser } from "./page";

export class BookingsPageParser extends PageParser {
  public getAvailableCourseTypes() {
    return Array.from(this.dom.querySelectorAll('[data-toggle="tab"]'))
      .map((element) => ({
        name: element.textContent.trim(),
        id: Number.parseInt(element.getAttribute("data-tab") ?? "-1"),
      }))
      .filter(({ name, id }) => name && Number.isFinite(id) && id >= 0);
  }

  public getAvailableCourses() {
    const tab = this.dom.querySelector(".tab-pane.active");
    if (!tab) {
      console.error("Course Type not found");
      return [];
    }
    return Array.from(
      tab.querySelector('[data-title="Kurs"]')?.querySelectorAll("option") ??
        [],
    )
      .map((e) => ({
        name: e.textContent.trim(),
        id: Number.parseInt(e.getAttribute("value") ?? "-1"),
      }))
      .filter(({ name, id }) => name && Number.isFinite(id) && id >= 0);
  }
  
  private getCourseRowText(row: HTMLElement, title: string) {
    return row.querySelector(`[data-title="${title}"]`)?.textContent?.trim();
  }

  private getCourseRowTextArray(row: HTMLElement, title: string) {
    return row.querySelector(`[data-title="${title}"]`)?.textContent?.split('\n')?.map((t) => t.trim()).filter((t) => t.length > 0);
  }
  
  public getFoundCourses() {
    const tab = this.dom.querySelector(".tab-pane.active");
    if (!tab) {
      console.error("Course Type not found");
      return [];
    }
    
    return Array.from(tab.querySelectorAll('tbody tr')).map(row => {
        const titleColumn = row.querySelector('[data-title="Kurs"]');
        const freiePlaetze = this.getCourseRowText(row, 'Freie Plätze');
        return {
            name: titleColumn?.textContent?.trim(),
            url: titleColumn?.querySelector('[href]')?.getAttribute('href')?.trim(),
            termin: this.getCourseRowText(row, 'Termin'),
            anzahlTermine: this.getCourseRowText(row, 'Anz. Termine'),
            uhrzeit: this.getCourseRowTextArray(row, 'Uhrzeit') ?? [],
            wochentag: this.getCourseRowTextArray(row, 'Wochentag') ?? [],
            freiePlaetze: freiePlaetze ? Number.parseInt(freiePlaetze) : undefined,
            baeder: this.getCourseRowText(row, 'M-Bäder'),
            ausgebucht: this.getCourseRowText(row, 'Funktionen') === 'Ausgebucht'
        }
    })
  }
}
