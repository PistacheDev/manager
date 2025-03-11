function updateValue(value, element)
{
    const target =  document.getElementById(element);
    if (!target) return;

    target.innerText = value;
    target.appendChild(document.createElement("br"));
};