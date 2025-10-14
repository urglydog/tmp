package nguyenchithien_shoppingdb.reposities;


import nguyenchithien_shoppingdb.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Calendar;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Tìm đơn hàng theo ID khách hàng
    List<Order> findByCustomerId(Integer customerId);

    // Tìm đơn hàng theo ngày đặt
    List<Order> findByDate(Calendar date);

    // Tìm đơn hàng trong khoảng thời gian
    List<Order> findByDateBetween(Calendar start, Calendar end);
}
