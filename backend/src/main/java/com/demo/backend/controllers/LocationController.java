package com.demo.backend.controllers;

import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.services.LocationDetailService;
import com.google.maps.GeoApiContext;
import com.google.maps.NearbySearchRequest;
import com.google.maps.PlaceDetailsRequest;
import com.google.maps.PlacesApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/location")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LocationController {

    @Autowired
    LocationDetailService locationDetailService;

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    @GetMapping("/api/best-locations-in-radius")
    public PlacesSearchResult[] getBestLocations(@RequestParam double lat, @RequestParam double lng, @RequestParam double radius) throws InterruptedException, ApiException, IOException, IOException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        LatLng location = new LatLng(lat, lng);
        PlacesSearchResponse response = PlacesApi.nearbySearchQuery(context, location)
                .radius((int) radius)
                .type(PlaceType.TOURIST_ATTRACTION)
                .await();

        return response.results;
    }

    @GetMapping("/api/tourist-attractions-in-radius")
    public LocationsDTO getLocationsInRadius(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius,
            @RequestParam(required = false) String pageToken
    ) throws InterruptedException, ApiException, IOException {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        LatLng location = new LatLng(lat, lng);
        NearbySearchRequest request = PlacesApi.nearbySearchQuery(context, location)
                .radius((int) radius)
                .type(PlaceType.TOURIST_ATTRACTION);

        System.out.println(pageToken);
        if (pageToken != "" && pageToken != null) {
            request = request.pageToken(pageToken);
        }

        PlacesSearchResponse response = request.await();
        LocationsDTO responseLocationAndToken = new LocationsDTO();
        responseLocationAndToken.setPageToken(response.nextPageToken);
        responseLocationAndToken.setPlaces(response.results);
        return responseLocationAndToken;
    }

    @GetMapping("/api/details/{placeId}")
    public LocationDetailsDTO getPlaceDetails(@PathVariable String placeId) throws IOException, InterruptedException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        PlaceDetailsRequest request = new PlaceDetailsRequest(context);
        PlaceDetails placeDetails = request.placeId(placeId).await();

        LocationDetailsDTO locationDetailsDTO = new LocationDetailsDTO();
        String country="";
        for (int i = 0; i<placeDetails.addressComponents.length;i++){
            for (AddressComponentType type : placeDetails.addressComponents[i].types){
                if (type.toString().toLowerCase().equals("country"))
                    country = placeDetails.addressComponents[i].longName.toString();
            }
        }
        locationDetailsDTO.setWikiDescription(locationDetailService.searchForPlaceDetails(placeDetails.name+ " " + country));
        locationDetailsDTO.setPlace(placeDetails);
        return locationDetailsDTO;
    }
}
