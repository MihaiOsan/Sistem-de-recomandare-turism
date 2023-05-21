package com.demo.backend.services;

import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.google.maps.PlaceDetailsRequest;
import com.google.maps.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.maps.GeoApiContext;
import com.google.maps.NearbySearchRequest;
import com.google.maps.PlacesApi;
import com.google.maps.errors.ApiException;

import java.io.IOException;
import java.util.Arrays;

@Service
public class LocationDetailService {

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;
    @Autowired
    private WikiService wikipediaService;

    public String searchForPlaceDescriptin(String query) throws IOException {
        String info;
        try{
            info = wikipediaService.searchForPlace(query);
        }catch (Exception e){
            info = "No content found";
        }
        if (info == "No content found")
            info = wikipediaService.getShortWikipediaDescription(query);
        if (info == null)
            info = "No content found";
        return info;
    }

    public LocationDetailsDTO getPlaceDetails(String placeId) throws IOException, InterruptedException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        PlaceDetailsRequest request = new PlaceDetailsRequest(context);
        PlaceDetails placeDetails = request.placeId(placeId).await();

        LocationDetailsDTO locationDetailsDTO = new LocationDetailsDTO();

        String country = Arrays.stream(placeDetails.addressComponents)
                .parallel()
                .filter(ac -> Arrays.stream(ac.types).anyMatch(t -> t.toString().equalsIgnoreCase("country")))
                .findFirst()
                .map(ac -> ac.longName)
                .orElse("");

        locationDetailsDTO.setWikiDescription(searchForPlaceDescriptin(placeDetails.name+ " " + country));
        locationDetailsDTO.setPlace(placeDetails);
        return locationDetailsDTO;
    }


    public LocationsDTO getLocationsInRadius(
            double lat,
            double lng,
            double radius,
            String pageToken,
            PlaceType locationType,
            String sortBy) throws InterruptedException, ApiException, IOException {

        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        LatLng location = new LatLng(lat, lng);

        NearbySearchRequest request = PlacesApi.nearbySearchQuery(context, location)
                .type(locationType);

        switch (sortBy.toLowerCase()) {
            case "distance":
                request = request.rankby(RankBy.DISTANCE);
                break;
            case "name":
                request = request.rankby(RankBy.valueOf("name"))
                        .radius((int) radius);
                break;
            default:
                request = request.rankby(RankBy.PROMINENCE)
                        .radius((int) radius);
                break;
        }

        if (pageToken != null && !pageToken.isEmpty()) {
            request = request.pageToken(pageToken);
        }

        PlacesSearchResponse response = request.await();
        LocationsDTO responseLocationAndToken = new LocationsDTO();
        responseLocationAndToken.setPageToken(response.nextPageToken);
        responseLocationAndToken.setPlaces(response.results);

        PlacesSearchResult lastPlace = responseLocationAndToken.getPlaces()[responseLocationAndToken.getPlaces().length-1];

        if (sortBy == "distance" && calculateDistance(new LatLng(lat,lng), new LatLng(lastPlace.geometry.location.lat,lastPlace.geometry.location.lng)) > (radius/1000))
            responseLocationAndToken.setPageToken(null);
        return responseLocationAndToken;
    }

    public static double calculateDistance(LatLng point1, LatLng point2) {
        final int EARTH_RADIUS = 6371; // Approx Earth radius in KM

        double dLat  = Math.toRadians((point2.lat - point1.lat));
        double dLong = Math.toRadians((point2.lng - point1.lng));

        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(point1.lat)) * Math.cos(Math.toRadians(point2.lat)) *
                        Math.sin(dLong/2) * Math.sin(dLong/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return EARTH_RADIUS * c;
    }



}
