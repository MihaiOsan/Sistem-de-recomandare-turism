package com.demo.backend.services.recommendation;

import com.demo.backend.models.DTO.LocationDetailsDTO;
import com.demo.backend.models.DTO.LocationToVisitDTO;
import com.demo.backend.models.DTO.LocationsDTO;
import com.demo.backend.services.LocationDetailService;
import com.google.maps.errors.ApiException;
import com.google.maps.model.AddressType;
import com.google.maps.model.PlaceType;
import com.google.maps.model.PlacesSearchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;
import weka.classifiers.lazy.IBk;
import weka.filters.Filter;
import weka.filters.unsupervised.attribute.StringToWordVector;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

@Service
public class RecommendationService {

    @Autowired
    DataPreparationService dataPreparationService;

    @Autowired
    LocationDetailService locationDetailService;

    public List<LocationToVisitDTO> recommendPlaces(List<LocationToVisitDTO> visitedPlaces, int K, int N) throws Exception {
        ArrayList<Attribute> attributes = createAttributes();
        List<LocationToVisitDTO> newPlaces = getNewPlaces();
        Instances dataset = createInstances(visitedPlaces, newPlaces, attributes);

        // Train KNN classifier
        IBk knn = new IBk(K);
        knn.buildClassifier(dataset);

        // Classify new instances and add predicted class to LocationToVisitDTO
        for (LocationToVisitDTO place : newPlaces) {
            Instance instance = createInstanceWithoutUserRating(place, attributes);
            instance.setDataset(dataset);
            double predictedClass = knn.classifyInstance(instance);
            place.setPredictedRating(predictedClass);
            // Print out the instance data and the predicted class
            System.out.println("Instance data: " + instance);
            System.out.println("Predicted class: " + predictedClass);
            System.out.println(place.getPlace().name+ " "+ place.getPredictedRating());
        }

        // Sort newPlaces by predicted rating and select top N
        newPlaces.sort(Comparator.comparing(LocationToVisitDTO::getPredictedRating).reversed());
        List<LocationToVisitDTO> recommendations = newPlaces.subList(0, N);

        return recommendations;
    }

    private Instances createInstances(List<LocationToVisitDTO> visitedPlaces, List<LocationToVisitDTO> newPlaces, ArrayList<Attribute> attributes) throws Exception {
        Instances dataset = new Instances("PlaceRecommendation", attributes, visitedPlaces.size() + newPlaces.size());

        // Add instances for visited places
        for (LocationToVisitDTO place : visitedPlaces) {
            Instance instance = createInstanceWithUserRating(place, attributes);
            dataset.add(instance);
        }

        // Add instances for new places
        for (LocationToVisitDTO place : newPlaces) {
            Instance instance = createInstanceWithoutUserRating(place, attributes);
            dataset.add(instance);
        }

        // Set class attribute
        dataset.setClassIndex(4); // set UserRating as class attribute

        // Apply StringToWordVector filter to string attributes
        StringToWordVector filter = new StringToWordVector();
        filter.setIDFTransform(true);
        filter.setTFTransform(true);
        filter.setLowerCaseTokens(true);
        filter.setOutputWordCounts(true);
        filter.setInputFormat(dataset);
// Print out the dataset before applying the filter
        System.out.println("Dataset before filter: " + dataset);
        dataset = Filter.useFilter(dataset, filter);
// Print out the dataset after applying the filter
        System.out.println("Dataset after filter: " + dataset);

        return dataset;
    }

    private Instance createInstanceWithUserRating(LocationToVisitDTO place, ArrayList<Attribute> attributes) throws IOException {
        Instance instance = new DenseInstance(attributes.size());

        instance.setValue(attributes.get(0), place.getPlace().rating);
        instance.setValue(attributes.get(1), place.getPlace().userRatingsTotal);
        String types="";
        for(AddressType pt : place.getPlace().types)
            types=types+ " " + pt.name();
        instance.setValue(attributes.get(2), dataPreparationService.textClean(types));
        instance.setValue(attributes.get(3), dataPreparationService.textClean(place.getWikiDescription()));
        double rand = 1 + (new Random()).nextInt(5); // generate a random user rating between 1 and 5
        System.out.println(rand);
        instance.setValue(attributes.get(4), rand);

        System.out.println("Instance with user rating: " + instance);
        return instance;
    }

    private Instance createInstanceWithoutUserRating(LocationToVisitDTO place, ArrayList<Attribute> attributes) throws IOException {
        Instance instance = new DenseInstance(attributes.size());

        instance.setValue(attributes.get(0), place.getPlace().rating);
        instance.setValue(attributes.get(1), place.getPlace().userRatingsTotal);
        String types="";
        for(AddressType pt : place.getPlace().types)
            types=types+ " " + pt.name();
        instance.setValue(attributes.get(2), dataPreparationService.textClean(types));
        instance.setValue(attributes.get(3), dataPreparationService.textClean(place.getWikiDescription()));

        System.out.println("Instance without user rating: " + instance);
        return instance;
    }
    private ArrayList<Attribute> createAttributes() {
        ArrayList<Attribute> attributes = new ArrayList<>();

        Attribute averageRating = new Attribute("AverageRating");
        Attribute numberOfReviews = new Attribute("NumberOfReviews");
        Attribute placeType = new Attribute("PlaceType", (ArrayList<String>)null);
        Attribute wikiDescription = new Attribute("WikiDescription", (ArrayList<String>)null);
        Attribute userRating = new Attribute("UserRating");

        attributes.add(averageRating);
        attributes.add(numberOfReviews);
        attributes.add(placeType);
        attributes.add(wikiDescription);
        attributes.add(userRating);

        return attributes;
    }


    private List<LocationToVisitDTO> getNewPlaces() throws IOException, InterruptedException, ApiException {
        LocationsDTO locationsDTO = locationDetailService.getLocationsInRadius(35.6895,139.6917, 10000, null, PlaceType.TOURIST_ATTRACTION,"prominence");
        List<LocationToVisitDTO> locationToVisitDTOS = new ArrayList<>();
        for(PlacesSearchResult psr:locationsDTO.getPlaces()){
            LocationDetailsDTO locationDetails = locationDetailService.getPlaceDetailsWithWiki(psr.placeId);
            LocationToVisitDTO location = new LocationToVisitDTO();
            location.setPlace(locationDetails.getPlace());
            location.setWikiDescription(locationDetails.getWikiDescription());
            locationToVisitDTOS.add(location);
        }
        return locationToVisitDTOS;
    }
}
