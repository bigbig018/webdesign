let contador = 0;

document.getElementById("Botao").onclick = () => {
    contador++;
    let toast = document.getElementById("toast");
    if (!toast){
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = `Você amou ${contador} vezes`;
    toast.classList.add("show");
};