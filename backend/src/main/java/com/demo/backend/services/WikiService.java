package com.demo.backend.services;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.Cache;
import okhttp3.CacheControl;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class WikiService {

    private static final String BASE_URL="https://en.wikipedia.org/api/rest_v1/page/summary/";
    private static final String WIKIPEDIA_API_BASE_URL = "https://en.wikipedia.org/w/api.php";
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    public WikiService() {
        int cacheSize = 10 * 1024 * 1024; // 10 MB
        Cache cache = new Cache(new File(System.getProperty("java.io.tmpdir")), cacheSize);
        httpClient = new OkHttpClient.Builder()
                .cache(cache)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
        objectMapper = new ObjectMapper();
    }

    public String searchForPlace(String query) throws IOException {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        String url = WIKIPEDIA_API_BASE_URL +
                "?action=query&list=search&format=json&srsearch=" + encodedQuery + "&utf8=&formatversion=2";

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);

        Request request = new Request.Builder()
                .url(builder.toUriString())
                .cacheControl(new CacheControl.Builder()
                        .maxAge(1, TimeUnit.DAYS)
                        .build())
                .build();

        Response response = httpClient.newCall(request).execute();
        String jsonResponse = response.body().string();

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

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);

        Request request = new Request.Builder()
                .url(builder.toUriString())
                .cacheControl(new CacheControl.Builder()
                        .maxAge(1, TimeUnit.DAYS)
                        .build())
                .build();

        Response response = httpClient.newCall(request).execute();
        String jsonResponse = response.body().string();

        JsonNode rootNode = objectMapper.readTree(jsonResponse);
        JsonNode pages = rootNode.path("query").path("pages");

        if (pages.isEmpty()) {
            return "No content found";
        }

        JsonNode firstPage = pages.elements().next();

        String pageContent = firstPage.get("extract").asText();
        return pageContent;
    }

    public String getShortWikipediaDescription(String title) {
        Request request = new Request.Builder()
                .url(BASE_URL + title)
                .get()
                .addHeader("Accept-Encoding", "gzip")
                .cacheControl(new CacheControl.Builder()
                        .maxAge(1, TimeUnit.DAYS)
                        .build())
                .build();
        try {
            Response response = httpClient.newCall(request).execute();
            String data = response.body().string();
            JSONParser parser = new JSONParser();
            JSONObject jsonObject = (JSONObject) parser.parse(data);

            return (String) jsonObject.get("extract");

        } catch (ParseException | IOException e) {
            e.printStackTrace();
        }
        return "No content found";
    }
}
