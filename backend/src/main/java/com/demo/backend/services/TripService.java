package com.demo.backend.services;

import com.demo.backend.models.DTO.NewTripInfo;
import com.demo.backend.models.DTO.PlaceAssignment;
import com.demo.backend.models.DTO.TimeInterval;
import com.demo.backend.models.DTO.WeatherData;
import com.google.maps.DirectionsApi;
import com.google.maps.DirectionsApiRequest;
import com.google.maps.GeoApiContext;
import com.google.maps.model.*;
import org.jgrapht.Graph;
import org.jgrapht.graph.DefaultWeightedEdge;
import org.jgrapht.graph.SimpleWeightedGraph;
import org.jgrapht.alg.shortestpath.DijkstraShortestPath;
import org.jgrapht.GraphPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TripService {

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    @Autowired
    WeatherService weatherService;

    public List<List<PlaceAssignment>> schedulePlaces(NewTripInfo tripInfo, List<PlaceDetails> places) throws IOException, InterruptedException {
        List<List<PlaceAssignment>> timeSlots = new ArrayList<>();
        Map<LatLng, PlaceDetails> placeDetailsMap = new HashMap<>();
        for (PlaceDetails place : places) {
            placeDetailsMap.put(place.geometry.location, place);
        }

        Graph<LatLng, DefaultWeightedEdge> graph = createGraph(places, tripInfo.getStartLocation());
        DijkstraShortestPath<LatLng, DefaultWeightedEdge> dijkstraAlg = new DijkstraShortestPath<>(graph);

        LocalDate startDate = tripInfo.getStartDate().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();

        List<PlaceDetails> remainingPlaces = new ArrayList<>(places);  // create a copy of places list

        for (int i = 0; i < tripInfo.getTripTimeSlots().size(); i++) {
            List<PlaceAssignment> timeSlot = new ArrayList<>();
            LocalDate currentDate = startDate.plusDays(i);
            LatLng currentLatLng = tripInfo.getStartLocation();
            List<PlaceDetails> placesCopy = new ArrayList<>(remainingPlaces);

            for (TimeInterval interval : tripInfo.getTripTimeSlots().get(i)) {
                LatLng nextLatLng = findNextLatLng(currentLatLng, dijkstraAlg, placesCopy, interval, currentDate);
                if (nextLatLng == null) {
                    continue;
                }
                PlaceDetails nextPlace = placeDetailsMap.get(nextLatLng);
                timeSlot.add(new PlaceAssignment(nextPlace, interval, currentDate));
                currentLatLng = nextLatLng;
                remainingPlaces.remove(nextPlace);  // remove visited place from remainingPlaces
                placesCopy.remove(nextPlace);  // remove from placesCopy, not places
            }

            timeSlots.add(timeSlot);
        }

        return timeSlots;
    }

    private SimpleWeightedGraph<LatLng, DefaultWeightedEdge> createGraph(List<PlaceDetails> places, LatLng startLocation) {
        SimpleWeightedGraph<LatLng, DefaultWeightedEdge> graph =
                new SimpleWeightedGraph<>(DefaultWeightedEdge.class);
        graph.addVertex(startLocation); // Add start location to graph
        for (int i = 0; i < places.size(); i++) {
            PlaceDetails place = places.get(i);
            graph.addVertex(place.geometry.location);
            double distance = getDrivingDistance(
                    startLocation,
                    place.geometry.location
            );
            DefaultWeightedEdge edge = graph.addEdge(startLocation, place.geometry.location);
            graph.setEdgeWeight(edge, distance);
            for (int j = i + 1; j < places.size(); j++) {
                PlaceDetails otherPlace = places.get(j);
                if (graph.containsVertex(otherPlace.geometry.location)) {
                    distance = getDrivingDistance(
                            place.geometry.location,
                            otherPlace.geometry.location
                    );
                    edge = graph.addEdge(place.geometry.location, otherPlace.geometry.location);
                    graph.setEdgeWeight(edge, distance);
                }
            }
        }
        return graph;
    }

    private LatLng findNextLatLng(LatLng currentLatLng, DijkstraShortestPath<LatLng, DefaultWeightedEdge> dijkstraAlg, List<PlaceDetails> places, TimeInterval interval, LocalDate currentDate) throws IOException, InterruptedException {
        double shortestDistance = Double.MAX_VALUE;
        LatLng nextLatLng = null;
        for (PlaceDetails place : places) {
            LatLng latLng = place.geometry.location;
            GraphPath<LatLng, DefaultWeightedEdge> path = dijkstraAlg.getPath(currentLatLng, latLng);
            if (path == null) {
                continue; // or handle this situation in another appropriate way
            }

            boolean placeTypeMatches = false;
            for (AddressType type : place.types) {
                if ((interval.getType().toLowerCase().equals("eating break") && (type == AddressType.RESTAURANT || type == AddressType.CAFE)) ||
                        (interval.getType().toLowerCase().equals("shopping spree") && type == AddressType.SHOPPING_MALL) ||
                        (interval.getType().toLowerCase().equals("visiting time") && (type == AddressType.TOURIST_ATTRACTION || type == AddressType.MUSEUM || type == AddressType.ART_GALLERY || type == AddressType.PARK || type == AddressType.PLACE_OF_WORSHIP))) {
                    placeTypeMatches = true;
                    break;
                }
            }
            if (!placeTypeMatches) {
                continue;
            }

            if(!isTimeSlotSuitable(place,interval,currentDate)){
                continue;
            }

            double distance = path.getWeight();
            if (distance < shortestDistance && distance !=0) {
                shortestDistance = distance;
                nextLatLng = latLng;
            }
        }
        return nextLatLng;
    }

    public boolean isTimeSlotSuitable(PlaceDetails place, TimeInterval timeSlot, LocalDate currentDate) throws IOException, InterruptedException {
        String currentDayOfWeek = currentDate.getDayOfWeek().toString().toLowerCase();
        String currentDayOpeningHours="";

        if (place.openingHours != null) {
            currentDayOpeningHours = Arrays.stream(place.openingHours.weekdayText)
                    .filter(s -> s.toLowerCase().startsWith(currentDayOfWeek))
                    .findFirst()
                    .orElse(null);
        }

        DateTimeFormatter timeFormatter12 = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
        DateTimeFormatter timeFormatter24 = DateTimeFormatter.ofPattern("H:mm");
        LocalTime placeStart, placeEnd;

        if (currentDayOpeningHours != null && !currentDayOpeningHours.contains("closed") && !currentDayOpeningHours.isEmpty()) {
            String[] splitOpeningHours = currentDayOpeningHours.split(": ")[1].split("–");
            if (splitOpeningHours.length < 2) {
                placeStart = LocalTime.of(0, 0);
                placeEnd = LocalTime.of(23, 59);
            } else {
                try{
                String openingTime = splitOpeningHours[0].replaceAll("[\u202F\u2009]", " ").trim();
                String closingTime = splitOpeningHours[1].replaceAll("[\u202F\u2009]", " ").trim();

                if (openingTime.contains("AM") || openingTime.contains("PM")) {
                    placeStart = LocalTime.parse(openingTime, timeFormatter12);
                } else {
                    placeStart = LocalTime.parse(openingTime, timeFormatter24);
                }

                if (closingTime.contains("AM") || closingTime.contains("PM")) {
                    placeEnd = LocalTime.parse(closingTime, timeFormatter12);
                } else {
                    placeEnd = LocalTime.parse(closingTime, timeFormatter24);
                }
                }catch (Exception e){
                    placeStart = LocalTime.of(0, 0);
                    placeEnd = LocalTime.of(23, 59);
                }
            }
        } else {
            placeStart = LocalTime.of(0, 0);
            placeEnd = LocalTime.of(23, 59);
        }

        LocalTime slotStart = LocalTime.parse(timeSlot.getStart(), DateTimeFormatter.ofPattern("HH:mm"));
        LocalTime slotEnd = LocalTime.parse(timeSlot.getEnd(), DateTimeFormatter.ofPattern("HH:mm"));

        if ((slotStart.isAfter(placeStart) || slotStart.equals(placeStart)) &&
                (slotEnd.isBefore(placeEnd) || slotEnd.equals(placeEnd))) {

            if (Arrays.asList(place.types).contains(AddressType.PARK)) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                String formattedDate = currentDate.format(formatter);
                WeatherData weatherData = (weatherService.getWeatherData(place.geometry.location.lat,place.geometry.location.lng,formattedDate,formattedDate)).get(0);
                if (weatherData.getPrecProb()>60 && weatherData.getPrecipType().equals("rain"))
                    return false;
            }
            return true;
        }

        return false;
    }

    public double getDrivingDistance(LatLng origin, LatLng destination) {
        GeoApiContext context = new GeoApiContext.Builder()
                .apiKey(googleMapsApiKey)
                .build();

        DirectionsApiRequest apiRequest = DirectionsApi.newRequest(context);
        apiRequest.origin(new com.google.maps.model.LatLng(origin.lat, origin.lng));
        apiRequest.destination(new com.google.maps.model.LatLng(destination.lat, destination.lng));
        apiRequest.mode(TravelMode.DRIVING);
        double distanceInMeters=9999999;

        try {
            DirectionsResult result = apiRequest.await();

            if (result.routes != null && result.routes.length > 0) {
                DirectionsRoute route = result.routes[0];
                distanceInMeters = route.legs[0].distance.inMeters;
            } else {
                distanceInMeters = calculateDistance(origin, destination);
            }
        } catch (Exception e) {
            System.out.println("Error with Google Maps API request: " + e.getMessage());
            distanceInMeters = calculateDistance(origin, destination);
        }
        return distanceInMeters;
    }

    public double calculateDistance(LatLng point1, LatLng point2) {
        System.out.println("6");
        final int EARTH_RADIUS = 6371;
        double dLat = Math.toRadians((point2.lat - point1.lat));
        double dLong = Math.toRadians((point2.lng - point1.lng));

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(point1.lat)) * Math.cos(Math.toRadians(point2.lat)) *
                        Math.sin(dLong / 2) * Math.sin(dLong / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}

