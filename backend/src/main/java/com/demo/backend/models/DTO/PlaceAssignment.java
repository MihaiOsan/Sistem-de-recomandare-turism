package com.demo.backend.models.DTO;

import com.demo.backend.models.DTO.TimeInterval;
import com.google.maps.model.PlaceDetails;

import java.time.LocalDate;

public class PlaceAssignment {
    private PlaceDetails place;
    private TimeInterval timeSlot;
    private LocalDate date;

    public PlaceAssignment(PlaceDetails place, TimeInterval timeSlot, LocalDate date) {
        this.place = place;
        this.timeSlot = timeSlot;
        this.date = date;
    }

    public PlaceDetails getPlace() {
        return place;
    }

    public TimeInterval getTimeSlot() {
        return timeSlot;
    }

    public LocalDate getDate() {
        return date;
    }
}