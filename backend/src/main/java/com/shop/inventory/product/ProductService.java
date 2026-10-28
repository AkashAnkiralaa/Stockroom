package com.shop.inventory.product;

import com.shop.inventory.product.ProductRequests.Create;
import com.shop.inventory.product.ProductRequests.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Product> findAll(String search) {
        if (search == null || search.isBlank()) {
            return repository.findAll(org.springframework.data.domain.Sort.by("name").ascending());
        }
        String query = search.trim();
        return repository
                .findByNameContainingIgnoreCaseOrProductIdContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrderByNameAsc(
                        query, query, query);
    }

    @Transactional
    public Product create(Create request) {
        String productId = request.productId().trim();
        if (repository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A product with this ID already exists");
        }
        String category = request.category() == null || request.category().isBlank()
                ? "Uncategorized"
                : request.category().trim();
        return repository.save(new Product(productId, request.name().trim(), request.price(),
                request.quantity(), category));
    }

    @Transactional
    public Product update(String productId, Update request) {
        if (!request.hasChanges()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide a price or quantity to update");
        }
        Product product = repository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (request.price() != null) {
            product.setPrice(request.price());
        }
        if (request.quantity() != null) {
            product.setQuantity(request.quantity());
        }
        if (request.category() != null) {
            product.setCategory(request.category().trim());
        }
        return repository.save(product);
    }

    @Transactional(readOnly = true)
    public Product findById(String productId) {
        return repository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }
}
