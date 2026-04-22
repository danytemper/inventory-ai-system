package com.inventory.service;

import com.inventory.dto.ProductDTO;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDTO> getAllProducts() {
        log.info("Fetching all products");
        return productRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toDTO(product);
    }

    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return toDTO(product);
    }

    public List<ProductDTO> getProductsByStore(String storeId) {
        log.info("Fetching products for store: {}", storeId);
        return productRepository.findByStoreId(storeId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getLowStockProducts() {
        log.info("Fetching all low stock products");
        return productRepository.findLowStockProducts()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getLowStockByStore(String storeId) {
        return productRepository.findLowStockProductsByStore(storeId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProductDTO createProduct(ProductDTO dto) {
        log.info("Creating product with SKU: {}", dto.getSku());
        Product product = toEntity(dto);
        return toDTO(productRepository.save(product));
    }

    public ProductDTO updateStock(Long id, Integer newStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        log.info("Updating stock for product {} from {} to {}", id, product.getCurrentStock(), newStock);
        product.setCurrentStock(newStock);
        return toDTO(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDTO toDTO(Product p) {
        String status = p.getCurrentStock() <= 0 ? "OUT_OF_STOCK"
                : p.getCurrentStock() <= p.getMinStockThreshold() ? "LOW_STOCK" : "IN_STOCK";
        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .description(p.getDescription())
                .category(p.getCategory())
                .currentStock(p.getCurrentStock())
                .minStockThreshold(p.getMinStockThreshold())
                .maxStockCapacity(p.getMaxStockCapacity())
                .storeId(p.getStoreId())
                .lastUpdated(p.getLastUpdated() != null ? p.getLastUpdated().toString() : null)
                .stockStatus(status)
                .build();
    }

    private Product toEntity(ProductDTO dto) {
        return Product.builder()
                .name(dto.getName())
                .sku(dto.getSku())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .currentStock(dto.getCurrentStock())
                .minStockThreshold(dto.getMinStockThreshold())
                .maxStockCapacity(dto.getMaxStockCapacity())
                .storeId(dto.getStoreId())
                .build();
    }
}
