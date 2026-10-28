package com.shop.inventory.product;

import com.shop.inventory.product.ProductRequests.Create;
import com.shop.inventory.product.ProductRequests.Update;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> getProducts(@RequestParam(required = false) String search) {
        return service.findAll(search);
    }

    @GetMapping("/{productId}")
    public Product getProduct(@PathVariable String productId) {
        return service.findById(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@Valid @RequestBody Create request) {
        return service.create(request);
    }

    @PatchMapping("/{productId}")
    public Product updateProduct(@PathVariable String productId, @Valid @RequestBody Update request) {
        return service.update(productId, request);
    }
}
