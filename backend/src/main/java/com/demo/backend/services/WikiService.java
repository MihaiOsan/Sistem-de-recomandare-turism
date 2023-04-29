package com.demo.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

@Service
public class WikiService {

    final String BASE_URL="https://en.wikipedia.org/api/rest_v1/page/summary/";
    private static final String WIKIPEDIA_API_BASE_URL = "https://en.wikipedia.org/w/api.php";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WikiService() {
        restTemplate = new RestTemplate();
        objectMapper = new ObjectMapper();
    }

    public String searchForPlace(String query) throws IOException {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = WIKIPEDIA_API_BASE_URL +
                "?action=query&list=search&format=json&srsearch=" + encodedQuery + "&utf8=&formatversion=2";

        String jsonResponse = restTemplate.getForObject(url, String.class);
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        JsonNode searchResults = rootNode.path("query").path("search");

        if (searchResults.isEmpty()) {
            return "No content found";
        }

        JsonNode firstResult = searchResults.get(0);
        String pageTitle = firstResult.get("title").asText();
        return getWikipediaPageContent(pageTitle);
    }

    public String getWikipediaPageContent(String pageTitle) throws IOException {
        String encodedTitle = URLEncoder.encode(pageTitle, StandardCharsets.UTF_8);
        String url = WIKIPEDIA_API_BASE_URL +
                "?action=query&prop=extracts&format=json&exintro=&explaintext=&titles=" + encodedTitle + "&utf8=&formatversion=2";

        String jsonResponse = restTemplate.getForObject(url, String.class);
        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        JsonNode pages = rootNode.path("query").path("pages");

        if (pages.isEmpty()) {
            return "No content found";
        }

        JsonNode firstPage = pages.elements().next();

        String pageContent = firstPage.get("extract").asText();
        return pageContent;
    }

    public String getWikipediaDescription(String title) {
        System.out.println(title);
        String apiUrl = "https://en.wikipedia.org/w/api.php";
        RestTemplate restTemplate = new RestTemplate();
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("action", "query")
                .queryParam("prop", "extracts")
                .queryParam("exintro", "1")
                .queryParam("explaintext", "1")
                .queryParam("format", "json")
                .queryParam("formatversion", "2")
                .queryParam("titles", title);

        ResponseEntity<String> response = restTemplate.getForEntity(uriBuilder.toUriString(), String.class);
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode pagesNode = rootNode.path("query").path("pages");
            Iterator<String> fieldNames = pagesNode.fieldNames();
            if (fieldNames.hasNext()) {
                String firstPageId = fieldNames.next();
                JsonNode pageNode = pagesNode.path(firstPageId);
                return pageNode.path("extract").asText();
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return null;
    }

    public String getShortWikipediaDescription(String title) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(BASE_URL+title)
                .get()
                .build();
        try {
            Response response=client.newCall(request).execute();
            String data = response.body().string();
            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject)parser.parse(data);

            return (String)jsonObject.get("extract");

        }
        catch (ParseException | IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
