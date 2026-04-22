package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull @Min(0)
    private Integer currentStock;

    @NotNull
    private Integer minStockThreshold;

    @NotNull
    private Integer maxStockCapacity;

    @NotBlank
    private String storeId;

    private String lastUpdated;

    private String stockStatus;
}
