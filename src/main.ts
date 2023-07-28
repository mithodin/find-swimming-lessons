import { SwmDownloader } from "./download";

async function main() {
    console.log('Hello World');
    const downloader = new SwmDownloader();
    
    const page = await downloader.getBookingsPage(new Map());
    
    console.log(page);
}

main().catch(e => {
    console.error('find-swimming-lessons failed', e);
});