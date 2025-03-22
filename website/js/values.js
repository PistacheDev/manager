function updateValue(value, element)
{
    const target =  document.getElementById(element);
    if (!target) return;

    target.innerText = value;
    target.appendChild(document.createElement("br"));
};

function updateSanctionValue(value, element)
{
    const target =  document.getElementById(element);
    if (!target) return;
    var output;

    if (value == 0) output = "Ban";
    else if (value == 24) output = "1d";
    else if (value == 48) output = "2d";
    else if (value == 72) output = "3d";
    else output = `${value}h`;

    target.innerText = output;
    target.appendChild(document.createElement("br"));
};