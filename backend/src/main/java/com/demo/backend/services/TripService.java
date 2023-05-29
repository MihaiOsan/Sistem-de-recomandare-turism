package com.demo.backend.services;

import com.demo.backend.models.DTO.NewTripInfo;
import com.demo.backend.models.DTO.PlaceAssignment;
import com.demo.backend.models.DTO.TimeInterval;
import com.google.maps.model.AddressType;
import com.google.maps.model.LatLng;
import com.google.maps.model.PlaceDetails;
import org.jgrapht.Graph;
import org.jgrapht.graph.DefaultWeightedEdge;
import org.jgrapht.graph.SimpleWeightedGraph;
import org.jgrapht.alg.shortestpath.DijkstraShortestPath;
import org.jgrapht.alg.interfaces.ShortestPathAlgorithm.SingleSourcePaths;
import org.jgrapht.GraphPath;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TripService {

    public List<List<PlaceAssignment>> schedulePlaces(NewTripInfo tripInfo, List<PlaceDetails> places) {
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

        Map<TimeInterval, Boolean> assignedTimeSlots = new HashMap<>();
        for (List<TimeInterval> timeSlotLists : tripInfo.getTripTimeSlots()) {
            for (TimeInterval timeSlot : timeSlotLists) {
                assignedTimeSlots.put(timeSlot, false);
            }
        }

        List<PlaceDetails> remainingPlaces = new ArrayList<>(places);  // create a copy of places list

        for (int i = 0; i < tripInfo.getTripTimeSlots().size(); i++) {
            List<PlaceAssignment> timeSlot = new ArrayList<>();
            LocalDate currentDate = startDate.plusDays(i);
            LatLng currentLatLng = tripInfo.getStartLocation();
            List<PlaceDetails> placesCopy = new ArrayList<>(remainingPlaces);

            while (true) {
                LatLng nextLatLng = findNextLatLng(currentLatLng, dijkstraAlg, placesCopy);
                if (nextLatLng == null) {
                    break;
                }

                PlaceDetails nextPlace = placeDetailsMap.get(nextLatLng);
                TimeInterval nextTimeInterval = findSuitableTimeSlot(nextPlace, tripInfo.getTripTimeSlots().get(i), currentDate, assignedTimeSlots);
                if (nextTimeInterval == null) {
                    placesCopy.remove(nextPlace);  // remove from placesCopy, not places
                } else {
                    timeSlot.add(new PlaceAssignment(nextPlace, nextTimeInterval, currentDate));
                    System.out.println("yes");
                    currentLatLng = nextLatLng;
                    remainingPlaces.remove(nextPlace);  // remove visited place from remainingPlaces\
                    placesCopy.remove(nextPlace);  // remove from placesCopy, not places
                }
            }
            timeSlots.add(timeSlot);
        }

        return timeSlots;
    }


    private SimpleWeightedGraph<LatLng, DefaultWeightedEdge> createGraph(List<PlaceDetails> places, LatLng startLocation) {
        SimpleWeightedGraph<LatLng, DefaultWeightedEdge> graph =
                new SimpleWeightedGraph<>(DefaultWeightedEdge.class);
        graph.addVertex(startLocation); // Add start location to graph
        System.out.println("Added vertex: " + startLocation);
        for (int i = 0; i < places.size(); i++) {
            PlaceDetails place = places.get(i);
            graph.addVertex(place.geometry.location);
            System.out.println("Added vertex: " + place.geometry.location);
            double distance = calculateDistance(
                    startLocation,
                    place.geometry.location
            );
            DefaultWeightedEdge edge = graph.addEdge(startLocation, place.geometry.location);
            graph.setEdgeWeight(edge, distance);
            for (int j = i + 1; j < places.size(); j++) {
                PlaceDetails otherPlace = places.get(j);
                if (graph.containsVertex(otherPlace.geometry.location)) {
                    distance = calculateDistance(
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

    private LatLng findNextLatLng(LatLng currentLatLng, DijkstraShortestPath<LatLng, DefaultWeightedEdge> dijkstraAlg, List<PlaceDetails> places) {
        double shortestDistance = Double.MAX_VALUE;
        System.out.println("4");
        LatLng nextLatLng = null;
        for (PlaceDetails place : places) {
            LatLng latLng = place.geometry.location;
            System.out.println("currentLatLng: " + currentLatLng + ", latLng: " + latLng);
            GraphPath<LatLng, DefaultWeightedEdge> path = dijkstraAlg.getPath(currentLatLng, latLng);
            if (path == null) {
                continue; // or handle this situation in another appropriate way
            }
            double distance = path.getWeight();

            if (distance < shortestDistance && distance !=0) {
                shortestDistance = distance;
                nextLatLng = latLng;
            }
        }
        if (nextLatLng == null) {
            System.out.println("No next location found");
        }
        return nextLatLng;
    }

    private TimeInterval findSuitableTimeSlot(PlaceDetails place, List<TimeInterval> timeSlots, LocalDate currentDate,Map<TimeInterval, Boolean> assignedTimeSlots) {
        System.out.println("5");
        String currentDayOfWeek = currentDate.getDayOfWeek().toString().toLowerCase();
        String currentDayOpeningHours="";
        if (place.openingHours != null) {
            currentDayOpeningHours = Arrays.stream(place.openingHours.weekdayText)
                    .filter(s -> s.toLowerCase().startsWith(currentDayOfWeek))
                    .findFirst()
                    .orElse(null);
        }

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
        LocalTime placeStart;
        LocalTime placeEnd;

        if (currentDayOpeningHours != null && !currentDayOpeningHours.contains("closed") && currentDayOpeningHours != "") {
            System.out.println(currentDayOpeningHours);
            String[] splitOpeningHours = currentDayOpeningHours.split(": ")[1].split("–");
            if (splitOpeningHours.length < 2) {
                placeStart = LocalTime.of(0, 0);
                placeEnd = LocalTime.of(23, 59);
            } else {
                // Replace non-breaking and thin spaces with regular spaces
                String openingTime = splitOpeningHours[0].replaceAll("[\u202F\u2009]", " ").trim();
                String closingTime = splitOpeningHours[1].replaceAll("[\u202F\u2009]", " ").trim();

                placeStart = LocalTime.parse(openingTime, timeFormatter);
                placeEnd = LocalTime.parse(closingTime, timeFormatter);
            }
        } else {
            placeStart = LocalTime.of(0, 0);
            placeEnd = LocalTime.of(23, 59);
        }

        for (TimeInterval timeSlot : timeSlots) {
            if (assignedTimeSlots.get(timeSlot)) {
                continue;
            }
            LocalTime slotStart = LocalTime.parse(timeSlot.getStart(), DateTimeFormatter.ofPattern("HH:mm"));
            LocalTime slotEnd = LocalTime.parse(timeSlot.getEnd(), DateTimeFormatter.ofPattern("HH:mm"));

            if ((slotStart.isAfter(placeStart) || slotStart.equals(placeStart)) &&
                    (slotEnd.isBefore(placeEnd) || slotEnd.equals(placeEnd))) {
                AddressType[] placeTypes = place.types;
                if (timeSlot.getType().equals("eating break")) {
                    for (AddressType type : placeTypes) {
                        if (type == AddressType.RESTAURANT || type == AddressType.CAFE) {
                            assignedTimeSlots.put(timeSlot, true);
                            return timeSlot;
                        }
                    }
                }
                if (timeSlot.getType().equals("shopping spree")) {
                    for (AddressType type : placeTypes) {
                        if (type == AddressType.SHOPPING_MALL) {
                            assignedTimeSlots.put(timeSlot, true);
                            return timeSlot;
                        }
                    }
                }
                if (timeSlot.getType().equals("visiting time"))
                    assignedTimeSlots.put(timeSlot, true);
                    return timeSlot;
            }
        }
        System.out.println("5null");
        return null;
    }


    public static double calculateDistance(LatLng point1, LatLng point2) {
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

