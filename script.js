/* =========================================================
   BARBEARIA BERTHOLDOS
   Supabase + rastreamento de cliques/leads
   ========================================================= */

/* 1) COLE AQUI AS SUAS CHAVES DO SUPABASE */
const SUPABASE_URL = "COLE_AQUI_SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_SUA_SUPABASE_ANON_KEY";

/* WhatsApp oficial da barbearia */
const WHATSAPP_URL =
  "https://wa.me/5585987232227?text=" +
  encodeURIComponent("Olá, Jimmy e Sula! Gostaria de agendar um horário na Barbearia Bertholdos.");

let supabaseClient = null;

/* Inicializa o Supabase sem impedir a página de funcionar caso
   as chaves ainda não tenham sido preenchidas. */
function iniciarSupabase() {
  if (
    typeof window.supabase === "undefined" ||
    SUPABASE_URL.includes("COLE_AQUI") ||
    SUPABASE_ANON_KEY.includes("COLE_AQUI")
  ) {
    console.info("Supabase ainda não configurado. WhatsApp continua funcionando normalmente.");
    return;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

/* Salva um evento na tabela 'leads'.
   Sugestão de colunas:
   id, event_type, source, page, user_agent, created_at
*/
async function registrarLead(source) {
  if (!supabaseClient) return;

  try {
    const { error } = await supabaseClient.from("leads").insert({
      event_type: "whatsapp_click",
      source: source || "unknown",
      page: window.location.pathname,
      user_agent: navigator.userAgent
    });

    if (error) {
      console.warn("Lead não salvo no Supabase:", error.message);
    }
  } catch (error) {
    console.warn("Falha ao registrar lead:", error);
  }
}

function prepararWhatsApp() {
  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.href = WHATSAPP_URL;

    link.addEventListener("click", () => {
      registrarLead(link.dataset.lead || "whatsapp");
    });
  });
}

function prepararNavbar() {
  const navbar = document.getElementById("navbar");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });
}

function prepararRevelacao() {
  const elements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((element) => observer.observe(element));
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarSupabase();
  prepararWhatsApp();
  prepararNavbar();
  prepararRevelacao();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
