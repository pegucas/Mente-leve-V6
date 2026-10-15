(function () {
  if (document.getElementById("mlv-root")) return;

  var IMG = "vlibras-copia/avatar-gov-menteleve.png";
  var TRANSLATE = "https://traducao2-dth.vlibras.gov.br/dl/translate";

  function beep(freq, ms, vol) {
    try {
      var ctx = beep._ctx || (beep._ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === "suspended") ctx.resume();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq || 880;
      g.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (ms || 160) / 1000);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + (ms || 160) / 1000);
    } catch (e) {}
  }
  function somPalavra() { beep(720, 90, 0.06); }
  function somFrase() { beep(520, 120, 0.08); setTimeout(function () { beep(880, 180, 0.09); }, 140); }

  var root = document.createElement("div");
  root.id = "mlv-root";
  root.innerHTML =
    '<button class="mlv-btn" id="mlv-open" title="Mente Leve em Libras">' +
    '<img src="' + IMG + '" alt="Avatar Mente Leve">' +
    "</button>" +
    '<div class="mlv-win" id="mlv-win">' +
    '  <div class="mlv-hd">Mente Leve · Libras <button id="mlv-x">×</button></div>' +
    '  <div class="mlv-av"><img src="' + IMG + '" alt="Mente Leve"><div class="mlv-name">Avatar: Mente Leve</div></div>' +
    '  <div class="mlv-bd">' +
    '    <textarea id="mlv-txt" placeholder="Texto para traduzir em Libras"></textarea>' +
    '    <button id="mlv-go">Traduzir</button>' +
    '    <div class="mlv-glosa" id="mlv-glosa">Som ao terminar palavra e frase.</div>' +
    "  </div>" +
    '  <div class="mlv-copy">Fonte: github.com/spbgovbr-vlibras · LGPL-3.0</div>' +
    "</div>" +
    '<div vw class="enabled"><div vw-access-button class="active"></div>' +
    '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>';
  document.body.appendChild(root);

  var win = document.getElementById("mlv-win");
  document.getElementById("mlv-open").onclick = function () {
    win.classList.toggle("open");
    try { (beep._ctx || new (window.AudioContext || window.webkitAudioContext)()).resume(); } catch (e) {}
  };
  document.getElementById("mlv-x").onclick = function () {
    win.classList.remove("open");
  };

  var timers = [];
  function limparTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  document.getElementById("mlv-go").onclick = function () {
    var text = document.getElementById("mlv-txt").value.trim();
    var box = document.getElementById("mlv-glosa");
    limparTimers();
    if (!text) {
      box.textContent = "Escreva uma frase.";
      return;
    }
    box.textContent = "Traduzindo…";
    fetch(TRANSLATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    })
      .then(function (r) { return r.text(); })
      .then(function (g) {
        var glosa = g || text;
        box.textContent = "Glosa: " + glosa;
        var partes = String(glosa).split(/[\s|]+/).filter(Boolean);
        partes.forEach(function (p, i) {
          timers.push(setTimeout(function () {
            box.textContent = "Palavra " + (i + 1) + "/" + partes.length + ": " + p;
            somPalavra();
            if (i === partes.length - 1) {
              timers.push(setTimeout(function () {
                box.textContent = "Frase concluída · " + glosa;
                somFrase();
              }, 280));
            }
          }, i * 420));
        });
        if (!partes.length) somFrase();
      })
      .catch(function () {
        box.textContent = "Servidor ocupado. Use o VLibras azul.";
        somFrase();
      });
  };

  var s = document.createElement("script");
  s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  s.onload = function () {
    if (window.VLibras && window.VLibras.Widget) {
      new window.VLibras.Widget("https://vlibras.gov.br/app");
    }
  };
  document.body.appendChild(s);
})();
