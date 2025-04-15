import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKYH1hJly4q0Vs4sFfu1Nu94OC540ZCA8",
  authDomain: "mystas-f4609.firebaseapp.com",
  projectId: "mystas-f4609",
  storageBucket: "mystas-f4609.appspot.com",
  messagingSenderId: "323505119825",
  appId: "1:323505119825:web:c08544c216a03dfce48e70",
  measurementId: "G-ZY2PB3CBS9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Inicializa reCAPTCHA invisível
window.recaptchaVerifier = new RecaptchaVerifier('enviar-codigo', {
  'size': 'invisible',
  'callback': (response) => enviarCodigoSMS(),
  'expired-callback': () => alert("Captcha expirado. Tente novamente."),
}, auth);

// Evento para envio do código
document.getElementById("enviar-codigo").addEventListener("click", () => {
  window.recaptchaVerifier.verify();
});

function enviarCodigoSMS() {
  const numero = document.getElementById("numero").value;
  const phone = "+244" + numero;

  const appVerifier = window.recaptchaVerifier;

  signInWithPhoneNumber(auth, phone, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      document.getElementById("verificacao").classList.remove("hidden");
      alert("Código enviado via SMS.");
    })
    .catch((error) => {
      console.error("Erro no envio:", error);
      alert("Erro ao enviar o código. Verifique o número e tente novamente.");
    });
}

// Verificar o código digitado
document.getElementById("verificar-codigo").addEventListener("click", () => {
  const codigo = document.getElementById("codigo").value;

  window.confirmationResult.confirm(codigo)
    .then(() => {
      alert("Número verificado com sucesso!");
      buscarApolices();
    })
    .catch(() => {
      alert("Código incorreto. Tente novamente.");
    });
});

// Buscar apólices
async function buscarApolices() {
  const numero = document.getElementById("numero").value;
  const apiUrl = "https://prod-140.westeurope.logic.azure.com:443/workflows/74734cce81d84cd6ae60286398788687/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Vcpb71QWuF6Ln8R469v_KoX3U97UeqehBdqq-O6runY";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contact: numero })
    });

    if (!response.ok) throw new Error("Erro ao buscar apólices.");

    const data = await response.json();
    mostrarApolices(data);
  } catch (error) {
    document.getElementById("responseData").innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

// Mostrar apólices
function mostrarApolices(apolices) {
  const container = document.getElementById("responseData");
  if (!Array.isArray(apolices) || apolices.length === 0) {
    container.innerHTML = "<p>Nenhuma apólice encontrada.</p>";
    return;
  }

  let html = `<p><strong>Total de Apólices:</strong> ${apolices.length}</p>`;

  apolices.forEach(a => {
    html += `
      <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
        <p><strong>Produto:</strong> ${a.productName}</p>
        <p><strong>Contrato:</strong> ${a.contractNumber}</p>
        <p><strong>Status:</strong> ${a.contractStatus}</p>
      </div>
    `;
  });

  container.innerHTML = html;
}
