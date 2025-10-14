package nguyenchithien_shoppingdb.controller;

import nguyenchithien_shoppingdb.entities.Customer;
import nguyenchithien_shoppingdb.services.CustomerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // ✅ Hiển thị danh sách khách hàng
    @GetMapping
    public String showAllCustomers(Model model) {
        List<Customer> customers = customerService.findAll();
        model.addAttribute("customers", customers);
        return "customer/list"; // -> templates/customer/list.html
    }
}
