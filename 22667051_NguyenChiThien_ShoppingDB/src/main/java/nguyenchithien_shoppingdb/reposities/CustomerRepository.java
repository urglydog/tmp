package nguyenchithien_shoppingdb.reposities;


import nguyenchithien_shoppingdb.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
}
