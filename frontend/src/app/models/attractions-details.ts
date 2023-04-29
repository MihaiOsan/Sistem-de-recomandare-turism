import { Geometry } from "./geometry";

export class AddressComponent {
    longName!: string;
    shortName!: string;
    types!: string[];
  }
  
  export class Photo {
    photoReference!: string;
    height!: number;
    width!: number;
    htmlAttributions!: string[];
  }
  
  export class OpeningHours {
    openNow!: boolean;
    periods!: { open: { day: string; time: string }; close: { day: string; time: string } }[];
    weekdayText!: string[];
    permanentlyClosed: any;
  }
  
  export class Review {
    aspects: any;
    authorName!: string;
    authorUrl!: string;
    language!: string;
    profilePhotoUrl!: string;
    rating!: number;
    relativeTimeDescription!: string;
    text!: string;
    time!: string;
  }
  
  export class Place {
    addressComponents!: AddressComponent[];
    adrAddress!: string;
    formattedAddress!: string;
    formattedPhoneNumber: any;
    geometry!: Geometry;
    icon!: string;
    internationalPhoneNumber: any;
    name!: string;
    openingHours!: OpeningHours;
    photos!: Photo[];
    placeId!: string;
    scope: any;
    plusCode!: { globalCode: string; compoundCode: string };
    permanentlyClosed!: boolean;
    userRatingsTotal!: number;
    altIds: any;
    priceLevel: any;
    rating!: number;
    reviews!: Review[];
    types!: string[];
    url!: string;
    utcOffset!: number;
    vicinity!: string;
    website!: string;
    htmlAttributions!: any[];
    businessStatus!: string;
  }
  
  export class AttractionsDetails{
    place!: Place;
    wikiDescription!: string;
  }
  