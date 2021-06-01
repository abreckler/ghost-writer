import RapidApiClient from './base';

//
// "Amazon Products API" by ZombieBest
// https://rapidapi.com/ZombieBest/api/amazon-products1
//
interface ZombieBestAmazonProductDetailRequest {
  country: string;
	asin: string;
}
interface ZombieBestAmazonProductDetailResponse {
  amazon_choice: boolean;
  asin: string;
  brand: string;
  category: string;
  coupon: {
    box_coupon: boolean;
    box_coupon_discount : number;
    coupon_code: string;
    coupon_discount: number;
  };
  deal_info: {
    deal_id: string;
    lightning_deal: boolean;
    requested_perc: number;
    timestamp_end: number;
  };
  description: string;
  error: boolean;
  full_link: string;
  images: Array<string>;
  out_of_stock: boolean;
  prices:{
    checkout_discount: number;
    currency: string;
    current_price: number;
    previous_price: number;
    prime_only_discount: number;
  };
  prime: boolean;
  reviews: {
    stars: number;
    total_reviews: number;
  };
  shipped_by: string;
  sold_by: string;
  sub_categories: string;
  title: string;
}

interface ZombieBestASINRequest {
  url: string;
}
interface ZombieBestASINResponse {
  asin: string;
  country: string;
  error: boolean;
}


class ZombieBestAmazonProductsApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, "amazon-products1.p.rapidapi.com", "https://amazon-products1.p.rapidapi.com/");
  }

  // Product Details Request
  public async getProductDetails(asin: string, country: string = "US" ): Promise<ZombieBestAmazonProductDetailResponse> {
    let params = {
      asin: asin,
      country: country,
    };
    return await this._doGet<ZombieBestAmazonProductDetailResponse>('/product' + new URLSearchParams(params));
  }

  // GET ASIN
  public async getASIN(url: string): Promise<ZombieBestASINResponse> {
    let params = {
      url: url,
    };
    return await this._doGet<ZombieBestASINResponse>('/asin' + new URLSearchParams(params));
  }
}

export {
  ZombieBestAmazonProductsApiClient,
  ZombieBestAmazonProductDetailRequest, ZombieBestAmazonProductDetailResponse,
  ZombieBestASINRequest, ZombieBestASINResponse,
};