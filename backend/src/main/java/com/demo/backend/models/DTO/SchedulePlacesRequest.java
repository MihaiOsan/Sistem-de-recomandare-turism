package com.demo.backend.models.DTO;

import lombok.Data;

import java.util.List;

@Data
public class SchedulePlacesRequest {
    private List<String> places;
    private NewTripInfo tripInfo;
}
