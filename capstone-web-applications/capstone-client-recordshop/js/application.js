let previewTimer = null;
let previewProgress = 0;

function showLoginForm()
{
    templateBuilder.build('login-form', {}, 'login');
}

function hideModalForm()
{
    templateBuilder.clear('login');
}

function login()
{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    userService.login(username, password);
    hideModalForm()
}

function showImageDetailForm(product, imageUrl)
{
    const imageDetail = { name: product, imageUrl: imageUrl };
    templateBuilder.build('image-detail',imageDetail,'login')
}

function loadHome()
{
    const main = document.getElementById("main");
    main.classList.remove("cart-mode");
    templateBuilder.build('home',{},'main', () => {
        productService.search();
        categoryService.getAllCategories(loadCategories);
    })
}

function editProfile(){ profileService.loadProfile(); }

function saveProfile()
{
    const profile = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value
    };

    profileService.updateProfile(profile);
}

function showCart(){ cartService.loadCartPage(); }
function clearCart(){ cartService.clearCart(); }

function checkout()
{
    const url = `${config.baseUrl}/orders`;

    axios.post(url, {})
        .then(response => {
            templateBuilder.append("message", { message: `Order #${response.data.orderId} placed. Your records are on the way.` }, "errors");
            cartService.loadCartForPage();
        })
        .catch(error => {
            console.log(error);
            templateBuilder.append("error", { error: "Checkout failed. Make sure your cart has items." }, "errors");
        });
}

function setCategory(control)
{
    productService.addCategoryFilter(control.value);
    productService.search();
}

function setSubcategory(control)
{
    productService.addSubcategoryFilter(control.value);
    productService.search();

    document.querySelectorAll(".genre-pill").forEach(button => {
        button.classList.toggle("active", button.dataset.genre === control.value);
    });
}

function setMinPrice(control)
{
    document.getElementById("min-price-display").innerText = control.value;
    const value = control.value != 0 ? control.value : "";
    productService.addMinPriceFilter(value)
    productService.search();
}

function setMaxPrice(control)
{
    document.getElementById("max-price-display").innerText = control.value;
    const value = control.value != 500 ? control.value : "";
    productService.addMaxPriceFilter(value)
    productService.search();
}

function selectGenrePill(button)
{
    const genre = button.dataset.genre;
    document.querySelectorAll(".genre-pill").forEach(pill => pill.classList.remove("active"));
    button.classList.add("active");

    const select = document.getElementById("subcategory-select");
    if(select) select.value = genre;

    productService.addSubcategoryFilter(genre);
    productService.search();
}

function clearRecordSearch()
{
    const search = document.getElementById("record-search");
    if(search) search.value = "";
    productService.setSearchQuery("");
}

function clearAllFilters(){ productService.clearAllFilters(); }

function toggleFavorite(event, button)
{
    event.stopPropagation();
    button.classList.toggle("active");
    const icon = button.querySelector("i");
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
}

function toggleHeroFavorite(button)
{
    button.classList.toggle("active");
    const icon = button.querySelector("i");
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
}

function togglePreview()
{
    if(previewTimer) pausePreview();
    else startPreview();
}

function startPreview()
{
    pausePreview(false);
    const playButton = document.getElementById("play-button");
    const disc = document.getElementById("hero-disc");
    if(playButton) playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
    if(disc) disc.classList.add("spinning");

    previewTimer = setInterval(() => {
        previewProgress += 1;
        const max = productService.currentPreview?.previewDuration || 208;
        if(previewProgress >= max)
        {
            resetPreviewProgress();
            pausePreview();
            return;
        }
        updatePreviewProgress();
    }, 1000);
}

function pausePreview(updateButton = true)
{
    if(previewTimer)
    {
        clearInterval(previewTimer);
        previewTimer = null;
    }

    const disc = document.getElementById("hero-disc");
    if(disc) disc.classList.remove("spinning");

    if(updateButton)
    {
        const playButton = document.getElementById("play-button");
        if(playButton) playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
}

function resetPreviewProgress()
{
    previewProgress = 0;
    updatePreviewProgress();
}

function updatePreviewProgress()
{
    const max = productService.currentPreview?.previewDuration || 208;
    const fill = document.getElementById("preview-progress");
    const current = document.getElementById("preview-current");
    const duration = document.getElementById("preview-duration");

    if(fill) fill.style.width = `${(previewProgress / max) * 100}%`;
    if(current) current.innerText = formatPreviewTime(previewProgress);
    if(duration) duration.innerText = formatPreviewTime(max);
}

function seekPreview(event)
{
    const max = productService.currentPreview?.previewDuration || 208;
    const rect = event.currentTarget.getBoundingClientRect();
    previewProgress = Math.round(((event.clientX - rect.left) / rect.width) * max);
    updatePreviewProgress();
}

function formatPreviewTime(seconds)
{
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function closeError(control)
{
    setTimeout(() => { control.click(); },3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadHome();
});
