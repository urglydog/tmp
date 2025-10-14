package nguyenchithien_shoppingdb.services;

import nguyenchithien_shoppingdb.entities.Product;

import java.util.List;

public interface ProductService {
    List<Product> findAll();
    Product findById(int id);
    Product save(Product product);
    void deleteById(int id);
}
