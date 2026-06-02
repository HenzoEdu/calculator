const botoes = document.querySelectorAll(".botoes button");
const tela = document.getElementById("calculadora-visor");

function calcularExpressao(expressaoBruta) {
  // Substitui todas as variações de multiplicação (✕, ×, x, X) e divisão (÷)
  let expr = expressaoBruta
    .replace(/✕/g, "*")
    .replace(/×/g, "*")
    .replace(/x/g, "*")
    .replace(/X/g, "*")
    .replace(/÷/g, "/");

  const regexPorcentagem = /(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)%/g;

  if (regexPorcentagem.test(expr)) {
    expr = expr.replace(regexPorcentagem, (match, n1, operador, n2) => {
      if (operador === "+" || operador === "-") {
        return `${n1} ${operador} (${n1} * ${n2} / 100)`;
      } else {
        return `${n1} ${operador} (${n2} / 100)`;
      }
    });
  } else {
    expr = expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  }

  let resultado = eval(expr);

  if (resultado % 1 !== 0) {
    resultado = parseFloat(resultado.toFixed(8));
  }
  return resultado;
}

function processarAcao(idBotao, textoBotao) {
  if (!isNaN(textoBotao)) {
    if (tela.textContent === "0" || tela.textContent === "Erro") {
      tela.textContent = textoBotao;
    } else {
      tela.textContent += textoBotao;
    }
  } else if (
    idBotao === "plus" ||
    idBotao === "menos" ||
    idBotao === "multi" ||
    idBotao === "divide"
  ) {
    const ultimo = tela.textContent.slice(-1);
    // Permite a inserção tratando o caractere que vem do clique do botão físico ou teclado
    if (
      !["+", "-", "✕", "×", "x", "÷", "/"].includes(ultimo) &&
      tela.textContent !== "Erro"
    ) {
      tela.textContent += textoBotao;
    }
  } else if (idBotao === "percent") {
    const ultimo = tela.textContent.slice(-1);
    if (
      tela.textContent !== "0" &&
      !isNaN(ultimo) &&
      ultimo !== " " &&
      tela.textContent !== "Erro"
    ) {
      tela.textContent += "%";
    }
  } else if (idBotao === "point") {
    const partes = tela.textContent.split(/[\+\-\✕\×\x\÷\/]/);
    const ultimoSegmento = partes[partes.length - 1];
    if (
      !ultimoSegmento.includes(".") &&
      !ultimoSegmento.includes("%") &&
      tela.textContent !== "Erro"
    ) {
      tela.textContent += ".";
    }
  } else if (idBotao === "clear") {
    tela.textContent = "0";
  } else if (idBotao === "backspace") {
    if (tela.textContent.length > 1 && tela.textContent !== "Erro") {
      tela.textContent = tela.textContent.slice(0, -1);
    } else {
      tela.textContent = "0";
    }
  } else if (idBotao === "raiz") {
    if (tela.textContent !== "0" && tela.textContent !== "Erro") {
      try {
        let res = Math.sqrt(calcularExpressao(tela.textContent));
        if (isNaN(res)) throw new Error();
        tela.textContent = res % 1 !== 0 ? parseFloat(res.toFixed(8)) : res;
      } catch {
        tela.textContent = "Erro";
      }
    }
  } else if (idBotao === "enter") {
    try {
      tela.textContent = calcularExpressao(tela.textContent);
    } catch {
      tela.textContent = "Erro";
    }
  }
}

botoes.forEach((botao) => {
  botao.addEventListener("click", function (e) {
    this.classList.remove("onda-ativa");
    void this.offsetWidth;

    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.style.setProperty("--x", `${x}px`);
    this.style.setProperty("--y", `${y}px`);
    this.classList.add("onda-ativa");

    setTimeout(() => {
      this.classList.remove("onda-ativa");
    }, 400);

    processarAcao(this.id, this.textContent);
  });
});

document.addEventListener("keydown", (e) => {
  let idMapeado = null;
  let textoMapeado = e.key;

  if (!isNaN(e.key) && e.key !== " ") {
    idMapeado = "numero";
  } else {
    switch (e.key) {
      case "+":
        idMapeado = "plus";
        break;
      case "-":
        idMapeado = "menos";
        break;
      case "*":
        idMapeado = "multi";
        textoMapeado = "✕";
        break;
      case "/":
        idMapeado = "divide";
        textoMapeado = "÷";
        break;
      case "%":
        idMapeado = "percent";
        break;
      case ".":
      case ",":
        idMapeado = "point";
        textoMapeado = ".";
        break;
      case "Enter":
      case "=":
        idMapeado = "enter";
        textoMapeado = "=";
        break;
      case "Backspace":
        idMapeado = "backspace";
        break;
      case "Escape":
        idMapeado = "clear";
        textoMapeado = "C";
        break;
    }
  }

  if (idMapeado) {
    e.preventDefault();
    let botaoDom =
      idMapeado === "numero"
        ? Array.from(botoes).find((b) => b.textContent.trim() === e.key)
        : document.getElementById(idMapeado);

    if (botaoDom) {
      botaoDom.click();
    } else {
      processarAcao(idMapeado, textoMapeado);
    }
  }
});
