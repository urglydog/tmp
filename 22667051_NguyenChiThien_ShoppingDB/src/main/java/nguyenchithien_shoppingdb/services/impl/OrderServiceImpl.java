package nguyenchithien_shoppingdb.services.impl;


import nguyenchithien_shoppingdb.entities.Order;
import nguyenchithien_shoppingdb.reposities.OrderRepository;
import nguyenchithien_shoppingdb.services.OrderService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Override
    public Order findById(int id) {
        return orderRepository.findById(id).orElse(null);
    }
}
