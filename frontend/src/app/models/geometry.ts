export interface Location {
    lat: number;
    lng: number;
  }
  
  export interface Viewport {
    northeast: Location;
    southwest: Location;
  }
  
  export interface Geometry {
    bounds: null;
    location: Location;
    locationType: null;
    viewport: Viewport;
  }
  