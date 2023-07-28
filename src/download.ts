import { CookieJar, Cookie } from "tough-cookie";

export type BookingsPageParams = {
    tab?: number;
    items_per_page?: number;
    page?: number;
};

export class SwmDownloader {
    private static readonly BASE_URL = 'https://m-baeder-tickets.swm.de';
    private static readonly BOOKINGS = '/de/bookings/block_list/';
    
    public static readonly singleton = new SwmDownloader();
    
    private readonly cookieJar = new CookieJar();
    
    public async getBookingsPage(params: BookingsPageParams = {}) {
          const url = new URL(SwmDownloader.BOOKINGS, SwmDownloader.BASE_URL);
          new Map(Object.entries(params)).forEach((value, key) => {
            url.searchParams.set(key, `${value}`);
          });
          
          try {
            const result = await this.makeRequest(url);
            return result.text();
          } catch(e) {
              console.error("error downloading bookings page", e);
              return "";
          }
    }
    
    private async makeRequest(url: URL) {
        const urlStr = url.toString();
        const cookieHeaderValue = await this.cookieJar.getCookieString(urlStr);
        
        const response = await fetch(urlStr, { headers: {
            cookie: cookieHeaderValue
        }});
        
        const newCookies = Cookie.parse(response.headers.get('set-cookie') ?? '');
        if (newCookies) {
            await this.cookieJar.setCookie(newCookies, urlStr);
        }
        
        return response;
    }
}