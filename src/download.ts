import { CookieJar, Cookie } from "tough-cookie";

export type BookingsPageParams = {
    tab?: number;
    items_per_page?: number;
    page?: number;
};

export type CourseSearchParams = {
    search_date_from?: string;
    search_number_of_periods?: number;
    search_time_of_day?: `${number}:${number}`;
    search_weekday?: number;
    search_free_places?: number;
    search_price_course?: number;
    active_tab_id: number;
    search_course_id_list?: Array<number>;
    search_location_id_list?: Array<number>;
}

export class SwmDownloader {
    private static readonly BASE_URL = 'https://m-baeder-tickets.swm.de';
    private static readonly BOOKINGS = '/de/bookings/block_list/';
    private static readonly BOOKINGS_SEARCH = (tab: number) => `/de/bookings/block_list_search_submit/bookable/0/tab/${tab}/`
    
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
    
    public async searchCourses(params: CourseSearchParams) {
        const data = new URLSearchParams();
        data.set('search_date_from', params.search_date_from ?? '');
        data.set('search_number_of_periods', `${params.search_number_of_periods ?? ''}`);
        data.set('search_time_of_day', params.search_time_of_day ?? '');
        data.set('search_weekday', `${params.search_weekday ?? ''}`);
        data.set('search_free_places', `${params.search_free_places ?? ''}`);
        data.set('search_price_course', `${params.search_price_course ?? ''}`);
        data.set('active_tab_id', `${params.active_tab_id}`);
        if (params.search_course_id_list) {
            params.search_course_id_list.forEach(id => {
                data.append('search_course_id_list[]', `${id}`);
            });
        }
        if (params.search_location_id_list) {
            params.search_location_id_list.forEach(id => {
                data.append('search_location_id_list[]', `${id}`);
            });
        }
        
        const url = new URL(SwmDownloader.BOOKINGS_SEARCH(params.active_tab_id), SwmDownloader.BASE_URL);
        
        try {
            const response = await this.makeRequest(url, 'POST', data);
        
            return response.text();
        } catch (e) {
              console.error("error searching for courses", e);
              return "";
        }
    }
    
    private async makeRequest(url: URL, method: 'GET' | 'POST' = 'GET', data?: URLSearchParams) {
        const urlStr = url.toString();
        let body: string | undefined = undefined;
        const headers: HeadersInit = {};

        const cookieHeaderValue = await this.cookieJar.getCookieString(urlStr);
        headers.cookie = cookieHeaderValue;
        
        if (method === 'POST' && data) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
            body = data.toString();
            console.log(body);
        }
        
        const response = await fetch(urlStr, { headers, body, method });
        
        const newCookies = Cookie.parse(response.headers.get('set-cookie') ?? '');
        if (newCookies) {
            await this.cookieJar.setCookie(newCookies, urlStr);
        }
        
        return response;
    }
}