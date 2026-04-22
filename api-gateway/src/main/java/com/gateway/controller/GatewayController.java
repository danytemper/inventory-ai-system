package com.gateway.controller;

import com.gateway.service.GatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GatewayController {

    private final GatewayService gatewayService;

    // =====================
    // HEALTH ENDPOINTS
    // =====================

    @GetMapping("/health")
    public ResponseEntity<Object> gatewayHealth() {
        return gatewayService.getAllServicesHealth();
    }

    // =====================
    // INVENTORY SERVICE ROUTES
    // GET /gateway/inventory/** → http://localhost:8080/api/inventory/**
    // =====================

    @GetMapping("/gateway/inventory/**")
    public ResponseEntity<Object> getInventory(
            @RequestParam(required = false) java.util.Map<String, String> params,
            jakarta.servlet.http.HttpServletRequest request) {
        String path = extractDownstreamPath(request, "/gateway/inventory", "/api/inventory");
        if (!params.isEmpty()) {
            path += buildQueryString(params);
        }
        return gatewayService.forwardToInventory(path, HttpMethod.GET, null);
    }

    @PostMapping("/gateway/inventory/**")
    public ResponseEntity<Object> postInventory(
            @RequestBody(required = false) Object body,
            jakarta.servlet.http.HttpServletRequest request) {
        String path = extractDownstreamPath(request, "/gateway/inventory", "/api/inventory");
        return gatewayService.forwardToInventory(path, HttpMethod.POST, body);
    }

    @PatchMapping("/gateway/inventory/**")
    public ResponseEntity<Object> patchInventory(
            @RequestBody(required = false) Object body,
            @RequestParam(required = false) java.util.Map<String, String> params,
            jakarta.servlet.http.HttpServletRequest request) {
        String path = extractDownstreamPath(request, "/gateway/inventory", "/api/inventory");
        if (!params.isEmpty()) {
            path += buildQueryString(params);
        }
        return gatewayService.forwardToInventory(path, HttpMethod.PATCH, body);
    }

    @DeleteMapping("/gateway/inventory/**")
    public ResponseEntity<Object> deleteInventory(
            jakarta.servlet.http.HttpServletRequest request) {
        String path = extractDownstreamPath(request, "/gateway/inventory", "/api/inventory");
        return gatewayService.forwardToInventory(path, HttpMethod.DELETE, null);
    }

    // =====================
    // AI PREDICTION SERVICE ROUTES
    // POST /gateway/predictions/** → http://localhost:8081/api/predictions/**
    // =====================

    @PostMapping("/gateway/predictions/**")
    public ResponseEntity<Object> postPrediction(
            @RequestBody(required = false) Object body,
            jakarta.servlet.http.HttpServletRequest request) {
        String path = extractDownstreamPath(request, "/gateway/predictions", "/api/predictions");
        return gatewayService.forwardToPrediction(path, HttpMethod.POST, body);
    }

    @GetMapping("/gateway/predictions/**")
    public ResponseEntity<Object> getPrediction(
            jakarta.servlet.http.HttpServletRequest request) {
        String path = extractDownstreamPath(request, "/gateway/predictions", "/api/predictions");
        return gatewayService.forwardToPrediction(path, HttpMethod.GET, null);
    }

    // =====================
    // HELPERS
    // =====================

    private String extractDownstreamPath(jakarta.servlet.http.HttpServletRequest request,
                                          String gatewayPrefix,
                                          String downstreamPrefix) {
        String uri = request.getRequestURI();
        String suffix = uri.substring(gatewayPrefix.length());
        return downstreamPrefix + suffix;
    }

    private String buildQueryString(java.util.Map<String, String> params) {
        if (params == null || params.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("?");
        params.forEach((k, v) -> sb.append(k).append("=").append(v).append("&"));
        return sb.toString().replaceAll("&$", "");
    }
}
