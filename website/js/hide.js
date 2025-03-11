function updateVisibility(id)
{
    const target = document.getElementById(id);
    if (!target) return;

    target.classList.toggle("hide");
};