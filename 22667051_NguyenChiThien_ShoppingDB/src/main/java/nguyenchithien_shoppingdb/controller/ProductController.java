package nguyenchithien_shoppingdb.controller;

import nguyenchithien_shoppingdb.entities.Product;
import nguyenchithien_shoppingdb.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/product")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ✅ Hiển thị danh sách tất cả sản phẩm
    @GetMapping
    public String showAllProducts(Model model) {
        List<Product> productList = productService.findAll();
        model.addAttribute("products", productList);
        return "product/list";
    }

    // ✅ Hiển thị chi tiết sản phẩm theo ID
    @GetMapping("/{id}")
    public String showProduct(@PathVariable int id, Model model) {
        Product product = productService.findById(id);
        model.addAttribute("product", product);
        return "product/productdetail";
    }

    // ✅ Hiển thị form thêm mới
    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("product", new Product());
        return "product/add";
    }

    // ✅ Lưu sản phẩm mới
    @PostMapping("/add")
    public String addProduct(@ModelAttribute("product") Product product) {
        productService.save(product);
        return "redirect:/product"; // Quay lại danh sách
    }

    // ✅ Hiển thị form sửa sản phẩm
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable int id, Model model) {
        Product product = productService.findById(id);
        if (product == null) {
            return "redirect:/product";
        }
        model.addAttribute("product", product);
        return "product/edit";
    }

    // ✅ Cập nhật sản phẩm
    @PostMapping("/edit/{id}")
    public String updateProduct(@PathVariable int id, @ModelAttribute("product") Product product) {
        product.setId(id);
        productService.save(product);
        return "redirect:/product";
    }

    // ✅ Xóa sản phẩm
    @GetMapping("/delete/{id}")
    public String deleteProduct(@PathVariable int id) {
        productService.deleteById(id);
        return "redirect:/product";
    }
}
