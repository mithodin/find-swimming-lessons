import { SwmDownloader } from "./download";
import { BookingsPageParser } from "./pages/bookings";

async function getCourseTypes() {
    const pageSource = await SwmDownloader.singleton.getBookingsPage();

    const page = new BookingsPageParser(pageSource);

    const courseTypes = page.getAvailableCourseTypes();
    return courseTypes;
}

async function getCoursesAndLocations(courseType: number) {
    const pageSource = await SwmDownloader.singleton.getBookingsPage({ tab: courseType });
    
    const page = new BookingsPageParser(pageSource);
    
    return { courses: page.getAvailableCourses(), locations: page.getAvailableLocations() };
}

async function getAvailableCourses(courseType: number, courseIds: Array<number>, locationIds: Array<number>) {
    const pageSource = await SwmDownloader.singleton.searchCourses({ active_tab_id: courseType, search_course_id_list: courseIds, search_location_id_list: locationIds, search_free_places: 1 });
    
    const page = new BookingsPageParser(pageSource);
    
    return page.getFoundCourses();
}

async function main() {
    const courseTypes = await getCourseTypes();
    
    const fuerKinder = courseTypes.find(({ name }) => name === 'Schwimmkurse für Kinder');
    if (!fuerKinder) {
        throw new Error('No courses for children found');
    }
    
    const { courses, locations } = await getCoursesAndLocations(fuerKinder.id);
    const myCourses = courses.filter(({ name }) => /^Anfänger.*ab 5 Jahren.*/.test(name)).map(({ id }) => id);
    const myLocations = locations.filter(({ name }) => name === 'Cosimawellenbad').map(({ id }) => id);
    
    const availableCourses = await getAvailableCourses(fuerKinder.id, myCourses, myLocations);
    if (availableCourses.length === 0) {
        process.exit(1);
    }

    console.log(`Good news! One or more matching courses have been found.\n${availableCourses.map(({ name, url, freiePlaetze }) => `${name} has ${freiePlaetze} free places. Sign up at ${url}.`).join('\n')}`);
}

main().catch(e => {
    console.error('find-swimming-lessons failed', e);
});
