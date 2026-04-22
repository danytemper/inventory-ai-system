package com.inventory.repository;

import com.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreId(String storeId);

    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(String category);

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.minStockThreshold")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.storeId = :storeId AND p.currentStock <= p.minStockThreshold")
    List<Product> findLowStockProductsByStore(String storeId);
}
