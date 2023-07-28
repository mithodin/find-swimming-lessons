import { SwmDownloader } from "./download";
import { BookingsPageParser } from "./pages/bookings";

async function getCourseTypes() {
    const pageSource = await SwmDownloader.singleton.getBookingsPage();

    const page = new BookingsPageParser(pageSource);

    const courseTypes = page.getAvailableCourseTypes();
    return courseTypes;
}

async function getCourses(courseType: number) {
    const pageSource = await SwmDownloader.singleton.getBookingsPage({ tab: courseType });
    
    const page = new BookingsPageParser(pageSource);
    
    return page.getAvailableCourses(courseType);
}

async function main() {
    const courseTypes = await getCourseTypes();
    
    const fuerKinder = courseTypes.find(({ name }) => name === 'Schwimmkurse für Kinder');
    if (!fuerKinder) {
        throw new Error('No courses for children found');
    }
    
    const courses = await getCourses(fuerKinder.id);
    console.log(courses.filter(({ name }) => /^Anfänger.*ab 5 Jahren.*/.test(name)));
}

main().catch(e => {
    console.error('find-swimming-lessons failed', e);
});
