package nguyenchithien_shoppingdb.services;

import nguyenchithien_shoppingdb.entities.Order;

import java.util.List;

public interface OrderService {
    List<Order> findAll();
    Order findById(int id);
}
