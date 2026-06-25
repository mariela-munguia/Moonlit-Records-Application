package org.yearup.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.yearup.models.CartItem;
import org.yearup.models.Product;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;
import org.yearup.repository.ShoppingCartRepository;

@Service
public class ShoppingCartService
{
    private final ShoppingCartRepository shoppingCartRepository;
    private final ProductService productService;

    public ShoppingCartService(ShoppingCartRepository shoppingCartRepository, ProductService productService)
    {
        this.shoppingCartRepository = shoppingCartRepository;
        this.productService = productService;
    }

    public ShoppingCart getByUserId(int userId)
    {
        ShoppingCart cart = new ShoppingCart();

        for (CartItem cartItem : shoppingCartRepository.findByUserId(userId))
        {
            Product product = productService.getById(cartItem.getProductId());

            if (product != null)
            {
                ShoppingCartItem item = new ShoppingCartItem();
                item.setProduct(product);
                item.setQuantity(cartItem.getQuantity());
                cart.add(item);
            }
        }

        return cart;
    }

    public ShoppingCart addProduct(int userId, int productId)
    {
        Product product = productService.getById(productId);

        if (product == null)
            return null;

        CartItem cartItem = shoppingCartRepository.findByUserIdAndProductId(userId, productId);

        if (cartItem == null)
        {
            cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(productId);
            cartItem.setQuantity(1);
        }
        else
        {
            cartItem.setQuantity(cartItem.getQuantity() + 1);
        }

        shoppingCartRepository.save(cartItem);
        return getByUserId(userId);
    }

    public ShoppingCart updateQuantity(int userId, int productId, int quantity)
    {
        Product product = productService.getById(productId);

        if (product == null)
            return null;

        CartItem cartItem = shoppingCartRepository.findByUserIdAndProductId(userId, productId);

        if (cartItem == null)
        {
            cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(productId);
        }

        cartItem.setQuantity(Math.max(quantity, 1));
        shoppingCartRepository.save(cartItem);
        return getByUserId(userId);
    }

    @Transactional
    public ShoppingCart clear(int userId)
    {
        shoppingCartRepository.deleteAll(shoppingCartRepository.findByUserId(userId));
        return getByUserId(userId);
    }
}
