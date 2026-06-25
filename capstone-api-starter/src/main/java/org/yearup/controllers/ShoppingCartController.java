package org.yearup.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;
import org.yearup.models.User;
import org.yearup.service.ShoppingCartService;
import org.yearup.service.UserService;

import java.security.Principal;

@RestController
@RequestMapping("cart")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class ShoppingCartController
{
    private final ShoppingCartService shoppingCartService;
    private final UserService userService;

    public ShoppingCartController(ShoppingCartService shoppingCartService, UserService userService)
    {
        this.shoppingCartService = shoppingCartService;
        this.userService = userService;
    }

    @GetMapping("")
    public ShoppingCart getCart(Principal principal)
    {
        return shoppingCartService.getByUserId(getCurrentUserId(principal));
    }

    @PostMapping("products/{productId}")
    public ResponseEntity<ShoppingCart> addProduct(@PathVariable int productId, Principal principal)
    {
        ShoppingCart cart = shoppingCartService.addProduct(getCurrentUserId(principal), productId);

        if (cart == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        return ResponseEntity.status(HttpStatus.CREATED).body(cart);
    }

    @PutMapping("products/{productId}")
    public ShoppingCart updateProduct(@PathVariable int productId, @RequestBody ShoppingCartItem item, Principal principal)
    {
        ShoppingCart cart = shoppingCartService.updateQuantity(getCurrentUserId(principal), productId, item.getQuantity());

        if (cart == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        return cart;
    }

    @DeleteMapping("")
    public ShoppingCart clearCart(Principal principal)
    {
        return shoppingCartService.clear(getCurrentUserId(principal));
    }

    private int getCurrentUserId(Principal principal)
    {
        User user = userService.getByUserName(principal.getName());

        if (user == null)
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);

        return user.getId();
    }
}
