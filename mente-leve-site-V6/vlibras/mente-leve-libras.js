/* Widget oficial VLibras + identidade Mente Leve
   Fonte: https://www.gov.br/governodigital/pt-br/vlibras/
   Código público: https://github.com/spbgovbr-vlibras
   O avatar 3D (Ícaro / Hosana / Guga) vem do servidor do governo.
   Aqui só rotulamos o plugin como assistente Mente Leve. */
(function () {
  if (document.getElementById("ml-vlibras-root")) return;

  var root = document.createElement("div");
  root.id = "ml-vlibras-root";
  root.innerHTML =
    '<div vw class="enabled">' +
    '  <div vw-access-button class="active"></div>' +
    '  <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>' +
    "</div>" +
    '<div class="ml-libras-tag">LIBRAS · <span>Mente Leve</span></div>';
  document.body.appendChild(root);

  var s = document.createElement("script");
  s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  s.onload = function () {
    if (window.VLibras && window.VLibras.Widget) {
      new window.VLibras.Widget("https://vlibras.gov.br/app");
    }
  };
  document.body.appendChild(s);
})();
