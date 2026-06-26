let productService;

class ProductService {
    photos = [];
    allProducts = [];
    renderedProducts = [];
    searchQuery = "";
    currentPreview = null;
    previewIndex = 0;

    filter = {
        cat: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        subCategory: undefined,
        queryString: () => {
            let qs = "";

            if(this.filter.cat)
            {
                qs = `cat=${this.filter.cat}`;
            }

            if(this.filter.minPrice)
            {
                const minP = `minPrice=${this.filter.minPrice}`;

                if(qs.length > 0)
                {
                    qs += `&${minP}`;
                }
                else
                {
                    qs = minP;
                }
            }

            if(this.filter.maxPrice)
            {
                const maxP = `maxPrice=${this.filter.maxPrice}`;

                if(qs.length > 0)
                {
                    qs += `&${maxP}`;
                }
                else
                {
                    qs = maxP;
                }
            }

            if(this.filter.subCategory)
            {
                const sub = `subCategory=${this.filter.subCategory}`;

                if(qs.length > 0)
                {
                    qs += `&${sub}`;
                }
                else
                {
                    qs = sub;
                }
            }

            return qs.length > 0 ? `?${qs}` : "";
        }
    }

    constructor()
    {
        axios.get("./images/products/photos.json")
            .then(response => {
                this.photos = response.data;
            });
    }

    hasPhoto(photo)
    {
        return this.photos.filter(p => p == photo).length > 0;
    }

    addCategoryFilter(cat)
    {
        if(cat == 0)
        {
            this.clearCategoryFilter();
        }
        else
        {
            this.filter.cat = cat;
        }
    }

    addMinPriceFilter(price)
    {
        if(price == 0 || price == "")
        {
            this.clearMinPriceFilter();
        }
        else
        {
            this.filter.minPrice = price;
        }
    }

    addMaxPriceFilter(price)
    {
        if(price == 0 || price == "")
        {
            this.clearMaxPriceFilter();
        }
        else
        {
            this.filter.maxPrice = price;
        }
    }

    addSubcategoryFilter(subCategory)
    {
        if(subCategory == "")
        {
            this.clearSubcategoryFilter();
        }
        else
        {
            this.filter.subCategory = subCategory;
        }
    }

    clearCategoryFilter()
    {
        this.filter.cat = undefined;
    }

    clearMinPriceFilter()
    {
        this.filter.minPrice = undefined;
    }

    clearMaxPriceFilter()
    {
        this.filter.maxPrice = undefined;
    }

    clearSubcategoryFilter()
    {
        this.filter.subCategory = undefined;
    }

    setSearchQuery(query)
    {
        this.searchQuery = query.toLowerCase().trim();
        this.renderProducts();
    }

    clearAllFilters()
    {
        this.filter.cat = undefined;
        this.filter.minPrice = undefined;
        this.filter.maxPrice = undefined;
        this.filter.subCategory = undefined;
        this.searchQuery = "";

        const search = document.getElementById("record-search");
        if(search) search.value = "";

        const category = document.getElementById("category-select");
        if(category) category.value = "0";

        const subcategory = document.getElementById("subcategory-select");
        if(subcategory) subcategory.value = "";

        const min = document.getElementById("min-price");
        const minLabel = document.getElementById("min-price-display");

        if(min) min.value = "0";
        if(minLabel) minLabel.innerText = "0";

        const max = document.getElementById("max-price");
        const maxLabel = document.getElementById("max-price-display");

        if(max) max.value = "500";
        if(maxLabel) maxLabel.innerText = "500";

        document.querySelectorAll(".genre-pill").forEach(button => {
            button.classList.toggle("active", button.dataset.genre === "");
        });

        this.search();
    }

    search()
    {
        const url = `${config.baseUrl}/products${this.filter.queryString()}`;

        axios.get(url)
            .then(response => {
                this.allProducts = response.data.map(product => this.prepareProduct(product));
                this.renderProducts();
            })
            .catch(error => {
                console.log(error);
                templateBuilder.append("error", { error: "Products failed to load. Make sure Spring Boot is running." }, "errors");
            });
    }

    prepareProduct(product)
    {
        if(this.photos.length > 0 && !this.hasPhoto(product.imageUrl))
        {
            product.imageUrl = "no-image.jpg";
        }

        const parts = product.name.split(" - ");
        const artist = parts.length > 1 ? parts[0] : "Moonlit Records";
        const title = parts.length > 1 ? parts.slice(1).join(" - ") : product.name;
        const description = product.description || "Fresh from the Moonlit crate.";

        const audioFileName = product.imageUrl.replace(/\.(jpg|jpeg|png)$/i, ".mp3");

        return {
            ...product,
            artist: artist,
            displayTitle: title.replace(" Vinyl", "").replace(" CD", ""),
            artistLine: `${artist}${product.subCategory ? " · " + product.subCategory : ""}`,
            shortDescription: description.length > 70 ? description.substring(0, 67) + "..." : description,
            labelCode: `MR-${String(product.productId).padStart(4, "0")}`,
            previewDuration: 188 + (product.productId % 8) * 12,
            previewUrl: `./audio/previews/${audioFileName}`
        };
    }

    renderProducts()
    {
        const products = this.allProducts.filter(product => {
            if(!this.searchQuery)
            {
                return true;
            }

            const haystack = `${product.name} ${product.description} ${product.subCategory}`.toLowerCase();
            return haystack.includes(this.searchQuery);
        });

        this.renderedProducts = products;

        templateBuilder.build('product', { products }, 'content', () => {
            this.enableButtons();
            this.updateRecordCount(products.length);
            this.ensurePreviewProduct(products);
        });
    }

    updateRecordCount(count)
    {
        const recordCount = document.getElementById("record-count");

        if(recordCount)
        {
            recordCount.innerText = count;
        }
    }

    ensurePreviewProduct(products)
    {
        if(!products.length)
        {
            return;
        }

        if(!this.currentPreview || !products.some(p => p.productId === this.currentPreview.productId))
        {
            this.setPreviewProduct(products[0], false, false);
        }
    }

    selectPreview(productId)
    {
        const product = this.allProducts.find(product => product.productId === productId);

        if(product)
        {
            this.setPreviewProduct(product, true, true);
        }
    }

    setPreviewProduct(product, shouldScroll, shouldPlay)
    {
        this.currentPreview = product;
        this.previewIndex = this.allProducts.findIndex(item => item.productId === product.productId);

        const cover = document.getElementById("hero-cover");
        const title = document.getElementById("hero-title");
        const artist = document.getElementById("hero-artist");
        const sample = document.getElementById("hero-sample");
        const price = document.getElementById("hero-price");
        const duration = document.getElementById("preview-duration");

        if(cover) cover.src = `./images/products/${product.imageUrl}`;
        if(title) title.innerText = product.displayTitle;
        if(artist) artist.innerText = product.artistLine.toUpperCase();
        if(sample) sample.innerText = `Sampling: "${product.shortDescription}"`;
        if(price) price.innerText = `$${product.price}`;
        if(duration) duration.innerText = formatPreviewTime(product.previewDuration);

        resetPreviewProgress();
        loadPreviewAudio(product);

        if(shouldPlay)
        {
            startPreview();
        }
        else
        {
            pausePreview();
        }

        if(shouldScroll)
        {
            document.getElementById("listen")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    nextPreview()
    {
        if(!this.allProducts.length)
        {
            return;
        }

        const next = (this.previewIndex + 1) % this.allProducts.length;
        this.setPreviewProduct(this.allProducts[next], false, true);
    }

    previousPreview()
    {
        if(!this.allProducts.length)
        {
            return;
        }

        const previous = (this.previewIndex - 1 + this.allProducts.length) % this.allProducts.length;
        this.setPreviewProduct(this.allProducts[previous], false, true);
    }

    addPreviewToCart()
    {
        if(!this.currentPreview)
        {
            templateBuilder.append("error", { error: "Choose a record first." }, "errors");
            return;
        }

        cartService.addToCart(this.currentPreview.productId);
    }

    enableButtons()
    {
        document.querySelectorAll(".add-button").forEach(button => {
            button.classList.remove("invisible");
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    productService = new ProductService();
});