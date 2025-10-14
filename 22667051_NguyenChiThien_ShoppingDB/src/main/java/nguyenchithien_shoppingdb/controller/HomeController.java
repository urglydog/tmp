package nguyenchithien_shoppingdb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;

@Controller
@RequestMapping("/home")  // định nghĩa URL gốc cho controller
public class HomeController {

    public HomeController() {
        super();
    }

    @GetMapping   // khi người dùng truy cập http://localhost:8085/home
    public String HomePage(Model model) {
        LocalDate date = LocalDate.now();            // lấy ngày hiện tại
        String mess = "Welcome Thymeleaf";           // thông báo hiển thị

        // thêm dữ liệu vào model để truyền sang trang HTML
        model.addAttribute("message", mess);
        model.addAttribute("date", date.toString());

        // trả về view có tên là home.html (trong /templates)
        return "home";
    }
}