export type BookingsPageParams = Map<'tab' | 'items_per_page' | 'page', number>;

export class SwmDownloader {
    private static readonly BASE_URL = 'https://m-baeder-tickets.swm.de';
    private static readonly BOOKINGS = '/de/bookings/block_list/';
    
    public async getBookingsPage(params: BookingsPageParams) {
          const url = new URL(SwmDownloader.BOOKINGS, SwmDownloader.BASE_URL);
          params.forEach((value, key) => {
            url.searchParams.set(key, `${value}`);
          });
          
          try {
            const result = await fetch(url.toString());
            return result.text();
          } catch(e) {
              console.error("error downloading bookings page", e);
              return "";
          }
    }
}