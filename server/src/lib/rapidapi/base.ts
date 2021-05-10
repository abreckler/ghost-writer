import Axios, { AxiosInstance } from "axios";

class RapidApiClient {

  API_KEY = "";
  API_HOST = "";
  API_BASEURL = "";
  DEBUG = !1;

  private axios_instance : AxiosInstance;

  public constructor(API_KEY: string, API_HOST: string, API_BASEURL: string) {
    this.API_KEY = API_KEY;
    this.API_HOST = API_HOST;
    this.API_BASEURL = API_BASEURL;

    this.axios_instance = Axios.create({
      baseURL: this.API_BASEURL,
      withCredentials: true,
      headers: {
        "content-type": "application/json",
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
    })
  }

  /**
   * internal function to do POST request to RapidAPI
   */
   public async _doPostJson<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url, params);

    let response = await this.axios_instance.post(url, params, {
      headers: {
        "content-type": "application/json",
      },
    });

    let json : ResponseType = await response.data;
    if (this.DEBUG)
      console.log(json);

    return json;
  }

  /**
   * internal function to do POST request to RapidAPI
   */
  public async _doPostForm<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url, params);

    let body = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      body.set(k, v);
    }

    let response = await this.axios_instance.post(url, body, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    let json : ResponseType = await response.data;
    if (this.DEBUG)
      console.log(json);

    return json;
  }

  /**
   * internal function to do GET request to OpenAI API
   */
  public async _doGet<ResponseType>(url: string) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url);

    let response = await this.axios_instance.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let json : ResponseType = await response.data;
    if (this.DEBUG)
      console.log(json);

    return json;
  }
}

export default RapidApiClient;