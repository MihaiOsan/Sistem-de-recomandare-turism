package com.demo.backend.services;

import com.demo.backend.models.DTO.WeatherData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    private RestTemplate restTemplate = new RestTemplate();

    public List<WeatherData> getWeatherData(Double lat, Double lng, String start, String end) throws IOException, InterruptedException {
        String url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" + lat + "%2C"+ lng +"/"+ start+"/"+end+"?unitGroup=metric&include=days&key=9UEKDFHPWD6QX7953NR4JPGNA&contentType=json";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .method("GET", HttpRequest.BodyPublishers.noBody())
                .build();
        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode root = objectMapper.readTree(response.body());
        List<WeatherData> weatherDataList = new ArrayList<>();
        JsonNode days = root.path("days");
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        for (JsonNode day : days) {
            WeatherData weatherData = new WeatherData();
            try {
                Date date = dateFormat.parse(day.path("datetime").asText());
                weatherData.setDate(date);
            } catch (ParseException e) {
                e.printStackTrace();
            }
            weatherData.setTemperature(day.path("tempmax").asDouble());
            weatherData.setHumidity(day.path("humidity").asDouble());
            weatherData.setIcon(day.path("conditions").asText());
            weatherData.setDescription(day.path("description").asText());
            weatherData.setPrecProb(day.path("precipprob").asDouble());
            weatherData.setPrecipType(day.path("preciptype").asText());
            weatherData.setTemperatureMax(day.path("tempmax").asDouble());
            weatherData.setTemperatureMin(day.path("tempmin").asDouble());
            weatherData.setHumidity(day.path("humidity").asDouble());
            weatherDataList.add(weatherData);
        }
        return weatherDataList;
    }
}
