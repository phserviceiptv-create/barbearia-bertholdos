/* BARBEARIA BERTHOLDOS — interações e rastreamento */
const SUPABASE_URL = "https://zjeclsozvjymuzwyhvqj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WyjaTHvDUwGPCwHaXcdApw_xlssm0TE";
const WHATSAPP_NUMBER = "5585987232227";
const MESSAGES = {
  navbar: "Olá, Jimmy e Sula! Gostaria de agendar um horário na Barbearia Bertholdos.",
  hero: "Olá, Jimmy e Sula! Vim pelo site da Barbearia Bertholdos e gostaria de agendar um horário.",
  "service-corte": "Olá, Jimmy e Sula! Vim pelo site e tenho interesse em agendar o serviço de Corte. Podem me informar os horários disponíveis?",
  "service-barba": "Olá, Jimmy e Sula! Vim pelo site e tenho interesse em agendar Barba + Toalha Quente. Podem me informar os horários disponíveis?",
  "service-selagem": "Olá, Jimmy e Sula! Vim pelo site e tenho interesse em agendar Selagem. Podem me informar os horários disponíveis?",
  location: "Olá, Jimmy e Sula! Vim pelo site da Barbearia Bertholdos e gostaria de agendar um horário.",
  footer: "Olá, Jimmy e Sula! Gostaria de agendar um horário na Barbearia Bertholdos.",
  "floating-whatsapp": "Olá, Jimmy e Sula! Vim pelo site da Barbearia Bertholdos e gostaria de agendar um horário."
};
let supabaseClient = null;

function whatsappUrl(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function iniciarSupabase(){
  if(typeof window.supabase === "undefined") return;
  try{
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }catch(error){
    console.warn("Supabase indisponível:", error);
  }
}

async function registrarLead(source){
  if(!supabaseClient) return;
  try{
    const {error}=await supabaseClient.from("leads").insert({
      event_type:"whatsapp_click",
      source:source||"unknown",
      page:window.location.pathname,
      user_agent:navigator.userAgent
    });
    if(error) console.warn("Lead não salvo no Supabase:",error.message);
  }catch(error){
    console.warn("Falha ao registrar lead:",error);
  }
}

function prepararWhatsApp(){
  document.querySelectorAll(".js-whatsapp").forEach(link=>{
    const source=link.dataset.lead||"whatsapp";
    const message=MESSAGES[source]||MESSAGES.hero;
    link.href=whatsappUrl(message);
    link.addEventListener("click",()=>registrarLead(source));
  });
}

function prepararNavbar(){
  const navbar=document.getElementById("navbar");
  if(!navbar)return;
  const update=()=>navbar.classList.toggle("scrolled",window.scrollY>20);
  update();
  window.addEventListener("scroll",update,{passive:true});
}

function prepararRevelacao(){
  const elements=document.querySelectorAll(".reveal");
  if(!elements.length)return;
  if(!("IntersectionObserver" in window)){
    elements.forEach(e=>e.classList.add("visible"));
    return;
  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),{threshold:.12});
  elements.forEach(e=>observer.observe(e));
}

document.addEventListener("DOMContentLoaded",()=>{
  iniciarSupabase();
  prepararWhatsApp();
  prepararNavbar();
  prepararRevelacao();
  const year=document.getElementById("year");
  if(year)year.textContent=new Date().getFullYear();
});
