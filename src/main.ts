import { SwmDownloader } from "./download";
import { BookingsPageParser } from "./pages/bookings";

async function getCourseTypes() {
  const pageSource = await SwmDownloader.singleton.getBookingsPage();

  const page = new BookingsPageParser(pageSource);

  const courseTypes = page.getAvailableCourseTypes();
  return courseTypes;
}

async function getCoursesAndLocations(courseType: number) {
  const pageSource = await SwmDownloader.singleton.getBookingsPage({
    tab: courseType,
  });

  const page = new BookingsPageParser(pageSource);

  return {
    courses: page.getAvailableCourses(),
    locations: page.getAvailableLocations(),
  };
}

async function getAvailableCourses(
  courseType: number,
  courseIds: Array<number>,
  locationIds: Array<number>,
) {
  const pageSource = await SwmDownloader.singleton.searchCourses({
    active_tab_id: courseType,
    search_course_id_list: courseIds,
    search_location_id_list: locationIds,
    search_free_places: 1,
  });

  const page = new BookingsPageParser(pageSource);

  return page.getFoundCourses();
}

async function getMatchingCourses(
  courseTypes: { name: string; id: number }[],
  courseTypeName: string,
) {
  const courseType = courseTypes.find(({ name }) => name === courseTypeName);
  if (!courseType) {
    return [];
  }
  const { courses, locations } = await getCoursesAndLocations(courseType.id);
  const myCourses = courses
    .filter(({ name }) => /.*Anfänger.*ab 5 Jahren.*/.test(name))
    .map(({ id }) => id);
  const myLocations = locations
    .filter(({ name }) => name === "Cosimawellenbad")
    .map(({ id }) => id);

  return getAvailableCourses(courseType.id, myCourses, myLocations);
}

function getForKids(courseTypes: { name: string; id: number }[]) {
  return getMatchingCourses(courseTypes, "Schwimmkurse für Kinder");
}

function getHolidayCourses(courseTypes: { name: string; id: number }[]) {
  return getMatchingCourses(courseTypes, "Ferienkurse");
}

async function main() {
  const courseTypes = await getCourseTypes();

  const availableCourses = [
    ...(await getForKids(courseTypes)),
    ...(await getHolidayCourses(courseTypes)),
  ];
  if (availableCourses.length === 0) {
    throw new Error("Could not find any courses");
  }

  console.log(
    `Good news! One or more matching courses have been found.\n${availableCourses
      .map(
        ({ name, url, freiePlaetze }) =>
          `${name} has ${freiePlaetze} free places. Sign up at ${url}.`,
      )
      .join("\n")}`,
  );
}

main().catch(() => {
  process.exit(1);
});
