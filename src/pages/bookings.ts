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

  public getAvailableCourses(courseTypeId: number) {
    const tab = Array.from(this.dom.querySelectorAll(".tab-pane.active")).find(
      (element) => element.id === `${courseTypeId}`,
    );
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
}
