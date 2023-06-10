package com.demo.backend.services.recommendation;

import com.demo.backend.models.DTO.LocationToVisitDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.services.LocationDetailService;
import com.demo.backend.services.WikiService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.PlaceType;
import com.google.maps.model.PlacesSearchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ContentBasedRecommedationService {

    @Autowired
    DataPreparationService dataPreparationService;

    @Autowired
    LocationDetailService locationDetailService;

    @Autowired
    WikiService wikiService;

    public LocationsDTO recommendPlaces(List<LocationToVisitDTO> visitedPlaces, double lat, double lng, double radius, PlaceType type) throws Exception {
        LocationsDTO newPlaces = getNewPlacesForRecommendation(lat, lng, radius, type);

        Map<PlacesSearchResult, Double> placeSimilarity = new ConcurrentHashMap<>();
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (PlacesSearchResult place : newPlaces.getPlaces()) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                String info;
                try {
                    info = wikiService.searchForPlace(place.name);
                } catch (Exception e) {
                    info = "No extract found";
                }
                Set<String> placeDescriptionWords = null;
                try {
                    placeDescriptionWords = new HashSet<>(Arrays.asList(dataPreparationService.textClean(info).split("\\s+")));
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
                double totalSimilarity = 0;
                for (LocationToVisitDTO visitedPlace : visitedPlaces) {
                    try {
                        totalSimilarity += calculateSimilarity(place, placeDescriptionWords, visitedPlace);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
                placeSimilarity.put(place, totalSimilarity);
            });
            futures.add(future);
        }

        // Wait for all futures to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        newPlaces.setPageToken(null);

        // Sort places by similarity and return the top-k places
        List<PlacesSearchResult> recommendedPlaces = new ArrayList<>(placeSimilarity.keySet());
        recommendedPlaces.sort((a, b) -> Double.compare(placeSimilarity.get(b), placeSimilarity.get(a)));

        newPlaces.setPlaces(recommendedPlaces.toArray(new PlacesSearchResult[0]));
        return newPlaces;
    }


    public double calculateSimilarity(PlacesSearchResult a, Set<String> aDescriptionWords, LocationToVisitDTO b) throws IOException {
        Set<String> aTypes = Arrays.stream(a.types).collect(Collectors.toSet());
        Set<String> bTypes = Arrays.stream(b.getPlace().types).map(Enum::name).collect(Collectors.toSet());


        double aRating = a.rating;
        double bRating = b.getPlace().rating;
        double maxPossibleRating = 5.0; // Assuming ratings are out of 5
        double ratingSimilarity = 1.0 - Math.abs(aRating - bRating) / maxPossibleRating;

        // Calculate type similarity as Jaccard coefficient
        double typeSimilarity = calculateJaccardCoefficient(aTypes, bTypes);

        // Calculate description similarity as Jaccard coefficient
        Set<String> bDescriptionWords = new HashSet<>(Arrays.asList(dataPreparationService.textClean(b.getWikiDescription()).split("\\s+")));
        double descriptionSimilarity = calculateJaccardCoefficient(aDescriptionWords, bDescriptionWords);

        // Combine the measures using weights that sum to 1
        double typeWeight = 0.325, descriptionWeight = 0.5, ratingWeight = 0.175;
        return typeWeight * typeSimilarity + descriptionWeight * descriptionSimilarity + ratingWeight * ratingSimilarity;
    }

    double calculateJaccardCoefficient(Set<String> setA, Set<String> setB) {
        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);
        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);
        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }


    private LocationsDTO getNewPlacesForRecommendation(double lat, double lng, double radius, PlaceType type) throws IOException, InterruptedException, ApiException {
        List<PlacesSearchResult> combinedPlaces = new ArrayList<>();
        String pageToken = null;
        do {
            LocationsDTO locationsDTO = locationDetailService.getLocationsInRadius(lat, lng, radius, pageToken, type, "prominence");
            combinedPlaces.addAll(Arrays.asList(locationsDTO.getPlaces()));
            pageToken = locationsDTO.getPageToken();
            Thread.sleep(2000);
        } while (pageToken != null && combinedPlaces.size()<40);
        LocationsDTO finalDTO = new LocationsDTO();
        finalDTO.setPlaces(combinedPlaces.toArray(new PlacesSearchResult[0]));
        return finalDTO;
    }
}
