const photo = document.getElementById("hero-photo");

window.addEventListener("scroll", () => {
    const scroll = window.scrollY;

    // Escala desde 1 hasta 1.5
    const scale = Math.min(1 + scroll / 1000, 1.5);

    photo.style.transform = `scale(${scale})`;
});