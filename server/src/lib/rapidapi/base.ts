class RapidApiClient {

  API_KEY = "";
  API_HOST = "";
  API_BASEURL = "";
  DEBUG = !1;

  public constructor(API_KEY: string, API_HOST: string, API_BASEURL: string) {
    this.API_KEY = API_KEY;
    this.API_HOST = API_HOST;
    this.API_BASEURL = API_BASEURL;
  }

  /**
   * internal function to do POST request to RapidAPI
   */
   public async _doPostJson<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url, params);

    let response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        "content-type": "application/json",
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(params), // body data type must match "Content-Type" header
    });

    let json : ResponseType = await response.json();
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

    let response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: body // body data type must match "Content-Type" header
    });

    let json : ResponseType = await response.json();
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

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
    });

    let json : ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }
}

export default RapidApiClient;