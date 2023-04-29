import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Attraction } from '../models/attraction';
import { AttractionService } from '../services/attraction.service';
import { AttractionsDetails } from '../models/attractions-details';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-attraction-details',
  templateUrl: './attraction-details.component.html',
  styleUrls: ['./attraction-details.component.css']
})
export class AttractionDetailsComponent implements OnInit {
  @ViewChild('GoogleMap') map!: GoogleMap;

  attractionId: string | null = null;
  attraction: AttractionsDetails | undefined;
  selectedPicture?: string;
  photos: string[] = [];
  attractionType: string = '';

  mapCongiguration = {
    mapTypeId: 'roadmap',
    disableDefaultUI: true,
    zoomControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
  };
  markerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };
  markerPositions!: google.maps.LatLngLiteral;
  

  constructor(private route: ActivatedRoute, private router: Router,private attractionService: AttractionService) { }

  ngOnInit(): void {
    this.attractionId = this.route.snapshot.paramMap.get('id');
    this.fetchAttractionDetails(this.attractionId!);
  }

  selectPicture(picture: any) {
    this.selectedPicture = picture;
  }

  fetchAttractionDetails(id:string) {
    this.attractionService.getAttractionDetails(id).subscribe(
      (data: AttractionsDetails) => {
        this.attraction = data;
        this.updateMap();
        for (let i = 0; i < this.attraction.place.photos.length; i++) {
          this.photos.push(this.getUrl(this.attraction.place.photos[i].photoReference));
        }
        for (let i = 0; i < this.attraction.place.types.length; i++) {
          this.attractionType += this.attraction.place.types[i].split("_").join(" ").toLowerCase();
          if (i!=this.attraction.place.types.length-1) this.attractionType += ", ";
        }
        this.selectPicture(this.photos[0]);
      }
    );
  }

  getUrl(reference:string): string { 
    const apiKey = "AIzaSyAILm8lpjdZbGCyZOgmKAW0z0sARKzKM9g&libraries=places"
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${reference}&key=${apiKey}`;
  }

  updateMap(): void {
    if (!this.attraction?.place?.geometry || !this.attraction?.place?.geometry?.location) {
      console.log('Returned place contains no geometry');
      return;
    }

    //console.log(this.attraction.place.reviews[0].profilePhotoUrl);

    if (this.attraction.place.geometry.location) {
      const latLngLiteral: google.maps.LatLngLiteral = {
        lat: this.attraction.place.geometry.location.lat,
        lng: this.attraction.place.geometry.location.lng,
      };
      this.markerPositions = latLngLiteral
    }
    const bounds = new google.maps.LatLngBounds();
    if (this.attraction.place.geometry.viewport) {
      const latLngBoundsLiteral: google.maps.LatLngBoundsLiteral = {
        north: this.attraction.place.geometry.viewport.northeast.lat,
        east: this.attraction.place.geometry.viewport.northeast.lng,
        south: this.attraction.place.geometry.viewport.southwest.lat,
        west: this.attraction.place.geometry.viewport.southwest.lng,
      };
      bounds.union(latLngBoundsLiteral);
    } else if (this.attraction.place.geometry.location) {
      const latLngLiteral: google.maps.LatLngLiteral = {
        lat: this.attraction.place.geometry.location.lat,
        lng: this.attraction.place.geometry.location.lng,
      };
      bounds.extend(latLngLiteral);
    } else {
      console.warn('No place geometry available');
    }

    this.map.fitBounds(bounds);
  }

  
}
