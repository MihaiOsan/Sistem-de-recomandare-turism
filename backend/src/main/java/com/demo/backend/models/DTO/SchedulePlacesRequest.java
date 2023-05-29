package com.demo.backend.models.DTO;

import lombok.Data;

import java.util.List;

@Data
public class SchedulePlacesRequest {
    private NewTripInfo tripInfo;
    private List<String> places;
}
