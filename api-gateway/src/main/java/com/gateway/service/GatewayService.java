package com.gateway.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GatewayService {

    private final RestTemplate restTemplate;

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    @Value("${prediction.service.url}")
    private String predictionServiceUrl;

    // ---- Inventory Service routing ----

    public ResponseEntity<Object> forwardToInventory(String path,
                                                      HttpMethod method,
                                                      Object body) {
        String url = inventoryServiceUrl + path;
        return forward(url, method, body, "Inventory Service");
    }

    // ---- Prediction Service routing ----

    public ResponseEntity<Object> forwardToPrediction(String path,
                                                       HttpMethod method,
                                                       Object body) {
        String url = predictionServiceUrl + path;
        return forward(url, method, body, "AI Prediction Service");
    }

    // ---- Health check for all services ----

    public ResponseEntity<Object> getAllServicesHealth() {
        Map<String, Object> healthStatus = new java.util.LinkedHashMap<>();

        healthStatus.put("gateway", "UP");
        healthStatus.put("inventoryService", checkServiceHealth(inventoryServiceUrl));
        healthStatus.put("aiPredictionService", checkServiceHealth(predictionServiceUrl));

        return ResponseEntity.ok(healthStatus);
    }

    // ---- Private helpers ----

    private ResponseEntity<Object> forward(String url, HttpMethod method,
                                            Object body, String serviceName) {
        try {
            log.info("Routing {} request to {}: {}", method, serviceName, url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Object> response = restTemplate.exchange(
                    url, method, entity, Object.class);

            log.info("Response from {}: status {}", serviceName, response.getStatusCode());
            return response;

        } catch (HttpClientErrorException e) {
            log.error("Client error from {}: {}", serviceName, e.getMessage());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of("error", e.getResponseBodyAsString(),
                                 "service", serviceName));
        } catch (ResourceAccessException e) {
            log.error("Service unavailable - {}: {}", serviceName, e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", serviceName + " is unavailable. Please try again later.",
                                 "service", serviceName));
        } catch (Exception e) {
            log.error("Unexpected error routing to {}: {}", serviceName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Gateway error: " + e.getMessage(),
                                 "service", serviceName));
        }
    }

    private String checkServiceHealth(String serviceUrl) {
        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(
                    serviceUrl + "/actuator/health", Object.class);
            return response.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}
