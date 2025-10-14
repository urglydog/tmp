package nguyenchithien_shoppingdb.services.impl;


import nguyenchithien_shoppingdb.entities.Customer;
import nguyenchithien_shoppingdb.reposities.CustomerRepository;
import nguyenchithien_shoppingdb.services.CustomerService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }
}
