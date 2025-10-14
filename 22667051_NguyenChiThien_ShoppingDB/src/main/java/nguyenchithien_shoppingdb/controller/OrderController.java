package nguyenchithien_shoppingdb.controller;

import nguyenchithien_shoppingdb.entities.Order;
import nguyenchithien_shoppingdb.services.OrderService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ✅ Hiển thị toàn bộ đơn hàng
    @GetMapping
    public String showAllOrders(Model model) {
        List<Order> orderList = orderService.findAll();
        model.addAttribute("orders", orderList);
        return "order/list"; // -> templates/order/list.html
    }

    // ✅ Hiển thị chi tiết đơn hàng theo ID
    @GetMapping("/{id}")
    public String showOrder(@PathVariable int id, Model model) {
        Order order = orderService.findById(id);
        model.addAttribute("order", order);
        return "order/orderdetail"; // -> templates/order/orderdetail.html
    }
}
