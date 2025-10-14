package nguyenchithien_shoppingdb.reposities;

import nguyenchithien_shoppingdb.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    // Tìm theo tên sản phẩm
    List<Product> findByNameContainingIgnoreCase(String name);

    // Lọc sản phẩm trong kho
    List<Product> findByInStockTrue();

    // Lọc sản phẩm theo khoảng giá
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);
}
