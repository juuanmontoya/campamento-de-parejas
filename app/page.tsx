"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

const WHATSAPP_NUMBER = "573133343648";

const whatsappLink = (message: string) =>
  `https://wa.me/${573133343648}?text=${encodeURIComponent(message)}`;

export default function Home() {
  const [nombre1, setNombre1] = useState("");
  const [nombre2, setNombre2] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipoAsistente, setTipoAsistente] = useState("");
  const [anosJuntos, setAnosJuntos] = useState("");
  const [requerimientos, setRequerimientos] = useState("");
  const [aceptaDatos, setAceptaDatos] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function enviarFormulario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!aceptaDatos) {
      setError("Debes aceptar el tratamiento de datos para continuar.");
      return;
    }

    setEnviando(true);
    setError("");

    const { error } = await supabase.from("preinscripciones").insert({
      nombre_persona_1: nombre1,
      nombre_persona_2: nombre2,
      whatsapp,
      tipo_asistente: tipoAsistente || null,
      anos_juntos: anosJuntos || null,
      requerimientos: requerimientos || null,
      acepta_datos: true,
      estado: "nuevo",
    });

    if (error) {
      console.error(error);
      setError(
        "No pudimos registrar la información. Por favor intenta nuevamente."
      );
      setEnviando(false);
      return;
    }

    setEnviado(true);
    setEnviando(false);
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-900">
      
      {/* =========================================================
          HERO — PARA DOS
      ========================================================= */}
      <section className="relative isolate overflow-hidden bg-[#B9DED4] text-[#253E35]">

        {/* Decoración de fondo */}
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#E5D7C3]/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#8BBBA9]/40 blur-3xl" />

        {/* Encabezado */}
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#345B4A]">
                Global Family
              </p>
              <p className="mt-1 text-xs text-[#527D6D]">
                Un espacio para volver a conectar
              </p>
            </div>

            <a
              href="#reserva"
              className="rounded-full border border-[#527D6D]/40 bg-white/30 px-4 py-2 text-xs font-semibold text-[#345B4A] transition hover:bg-white/60 sm:px-6 sm:py-3 sm:text-sm"
            >
              Inscripciones
            </a>
          </div>

          {/* Contenido principal */}
          <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-12">

            {/* Texto */}
            <div className="relative z-10 text-center lg:text-left">

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#527D6D] sm:text-sm">
                16 · 17 · 18 de octubre de 2026
              </p>

              <h1 className="mt-6 text-7xl font-black uppercase leading-[0.82] tracking-[-0.07em] text-[#F0E1CE] [text-shadow:2px_4px_0px_#A9947C,4px_8px_12px_rgba(60,50,35,0.16)] sm:text-8xl lg:text-[110px]">
                PARA
                <span className="block">DOS</span>
              </h1>

              <div className="mx-auto mt-7 h-1 w-20 rounded-full bg-[#527D6D] lg:mx-0" />

              <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#253E35] sm:text-3xl">
                Campamento de Parejas
              </h2>

              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#476B5E] sm:text-lg sm:leading-8 lg:mx-0">
                Tres días para desconectarse de la rutina, disfrutar juntos
                y volver a conectar con lo que realmente importa.
              </p>

              {/* Ubicación */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-[#345B4A] lg:justify-start">
                <span>📍 Hotel Tocarema</span>
                <span className="text-[#8BBBA9]">·</span>
                <span>Girardot, Cundinamarca</span>
              </div>

              {/* Precio */}
              <div className="mt-8 rounded-3xl border border-[#8BBBA9]/50 bg-white/35 p-5 backdrop-blur-sm sm:inline-block sm:min-w-[320px] sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#527D6D]">
                  Inversión por pareja
                </p>

                <p className="mt-2 text-4xl font-black tracking-tight text-[#253E35] sm:text-5xl">
                  $1.500.000
                </p>

                <p className="mt-2 text-sm text-[#476B5E]">
                  Transporte, hospedaje y alimentación incluidos
                </p>
              </div>

              {/* Botones */}
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <a
                  href="#reserva"
                  className="rounded-full bg-[#345B4A] px-8 py-4 text-center font-semibold text-white shadow-lg shadow-[#345B4A]/20 transition hover:-translate-y-1 hover:bg-[#264737]"
                >
                  Quiero reservar mi cupo
                </a>

                <a
                  href={whatsappLink(
                    "Hola, quiero recibir información sobre PARA DOS, el Campamento de Parejas 2026."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[#527D6D]/40 bg-white/40 px-8 py-4 text-center font-semibold text-[#294A3E] transition hover:bg-white/70"
                >
                  Hablar por WhatsApp
                </a>
              </div>
            </div>

            {/* Fotografía protagonista */}
            <div className="relative mx-auto w-full max-w-xl">

              {/* Marco decorativo */}
              <div className="absolute -inset-3 rotate-3 rounded-[3rem] bg-[#E5D7C3]/70" />

              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-[6px] border-[#F0E1CE]/80 shadow-2xl">

                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85"
                  alt="Pareja compartiendo un momento especial"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#172F26]/65 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E5D7C3]">
                    Un tiempo para ustedes
                  </p>

                  <p className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">
                    Porque su historia
                    <br />
                    merece tiempo.
                  </p>
                </div>
              </div>

              {/* Etiqueta flotante */}
              <div className="absolute -bottom-5 -left-2 rounded-2xl border border-white/60 bg-[#F0E1CE] px-5 py-4 shadow-lg sm:-left-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#527D6D]">
                  Una experiencia
                </p>
                <p className="mt-1 text-sm font-bold text-[#345B4A]">
                  Para ustedes dos ❤️
                </p>
              </div>
            </div>
          </div>

          {/* Indicador de contenido */}
          <div className="mt-16 flex flex-col items-center gap-2 text-[#527D6D]">
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              Descubre la experiencia
            </span>
            <span className="text-xl">↓</span>
          </div>
        </div>
      </section>

            {/* =========================================================
          INTRO — PARA DOS
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#F0E1CE] px-6 py-20 sm:py-28">
        {/* Decoración */}
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#B9DED4]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#B9DED4]/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#527D6D] sm:text-sm">
            Un tiempo para ustedes
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#253E35] sm:text-5xl lg:text-6xl">
            Porque su relación también
            <span className="block text-[#527D6D]">
              merece una pausa.
            </span>
          </h2>

          <div className="mx-auto mt-7 h-1 w-16 rounded-full bg-[#527D6D]" />

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-[#476B5E] sm:text-xl sm:leading-9">
            Entre el trabajo, los hijos, las responsabilidades y la rutina,
            muchas veces terminamos compartiendo la vida sin realmente
            compartirnos el uno al otro.
          </p>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#476B5E] sm:text-xl sm:leading-9">
            <strong className="font-semibold text-[#345B4A]">
              PARA DOS
            </strong>{" "}
            nace para regalarles unos días diferentes: para conversar sin
            afán, reír juntos, descansar y recordar todo lo que han construido.
          </p>

          {/* Frase central */}
          <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-[#B9DED4] bg-[#B9DED4]/50 px-7 py-8 sm:px-12 sm:py-10">
            <div className="text-4xl text-[#527D6D]">“</div>

            <p className="mt-2 text-2xl font-semibold leading-relaxed text-[#345B4A] sm:text-3xl">
              No se trata solamente de salir de la rutina.
              <span className="block text-[#527D6D]">
                Se trata de volver a encontrarse.
              </span>
            </p>

            <div className="mt-5 text-4xl text-[#527D6D]">”</div>
          </div>

          {/* Mini datos */}
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/60 px-5 py-6 ring-1 ring-[#D7C8B5]">
              <div className="text-3xl">❤️</div>
              <p className="mt-3 font-semibold text-[#345B4A]">
                Tiempo de calidad
              </p>
              <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                Espacios para hablar, escuchar y disfrutar juntos.
              </p>
            </div>

            <div className="rounded-3xl bg-white/60 px-5 py-6 ring-1 ring-[#D7C8B5]">
              <div className="text-3xl">🌿</div>
              <p className="mt-3 font-semibold text-[#345B4A]">
                Desconectarse
              </p>
              <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                Alejarse por unos días del ruido y la rutina.
              </p>
            </div>

            <div className="rounded-3xl bg-white/60 px-5 py-6 ring-1 ring-[#D7C8B5]">
              <div className="text-3xl">✨</div>
              <p className="mt-3 font-semibold text-[#345B4A]">
                Volver a conectar
              </p>
              <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                Recordar lo que los une y seguir construyendo su historia.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          EXPERIENCE CARDS
      ========================================================= */}
      <section className="bg-white px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
              Todo preparado
            </p>

            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Ustedes solo tienen que llegar y disfrutar.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🚌",
                title: "Transporte",
                text: "Nos encargamos del transporte para que ustedes solo se preocupen por disfrutar.",
              },
              {
                icon: "🏨",
                title: "Hospedaje",
                text: "Dos noches para descansar y compartir en el Hotel Tocarema.",
              },
              {
                icon: "🍽️",
                title: "Alimentación",
                text: "Alimentación incluida durante la experiencia.",
              },
              {
                icon: "❤️",
                title: "Experiencia",
                text: "Espacios, actividades y momentos diseñados para conectar como pareja.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-[#fffaf7] p-7 ring-1 ring-slate-100"
              >
                <div className="text-4xl">{item.icon}</div>

                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
   
      
      {/* =========================================================
          HOTEL TOCAREMA — PARA DOS
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#B9DED4] px-5 py-20 text-[#253E35] sm:px-8 sm:py-28">

        <div className="mx-auto max-w-7xl">

          {/* Encabezado */}
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#527D6D] sm:text-sm">
              Nuestro destino
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
              Tres días para ustedes.
              <span className="block text-[#527D6D]">
                Un lugar para disfrutar.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#476B5E] sm:text-lg sm:leading-8">
              Nos vamos a Girardot para vivir PARA DOS en un entorno
              tropical, rodeados de naturaleza, descanso y momentos
              especiales para compartir.
            </p>
          </div>

          {/* Fotografía principal real del hotel */}
          <div className="relative mt-12 overflow-hidden rounded-[2rem] shadow-xl sm:mt-16 sm:rounded-[3rem]">

            <img
              src="https://www.hoteltocarema.com/assets/img/Hotel_Tocarema_7.jpg"
              alt="Vista aérea del Hotel Tocarema en Girardot, sus piscinas y jardines"
              className="h-[380px] w-full object-cover sm:h-[550px] lg:h-[650px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#172F26]/80 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-12">
              <span className="inline-flex rounded-full bg-[#F0E1CE] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#345B4A]">
                16 — 18 de octubre de 2026
              </span>

              <h3 className="mt-5 text-3xl font-semibold sm:text-5xl">
                Hotel Tocarema
              </h3>

              <p className="mt-2 text-base text-white/90 sm:text-lg">
                Girardot · Cundinamarca
              </p>
            </div>
          </div>

          {/* Instalaciones */}
          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#527D6D]">
                El lugar de nuestra experiencia
              </p>

              <h3 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                Un ambiente tropical para salir de la rutina.
              </h3>

              <p className="mt-5 text-base leading-7 text-[#476B5E] sm:text-lg sm:leading-8">
                El Hotel Tocarema combina espacios de descanso,
                instalaciones recreativas y zonas rodeadas de vegetación
                para disfrutar de una pausa diferente.
              </p>

              <a
                href="https://hoteltocarema.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-[#345B4A] underline underline-offset-4 transition hover:text-[#527D6D]"
              >
                Conoce el hotel
                <span>↗</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-3xl bg-[#F0E1CE] p-5 sm:p-7">
                <span className="text-3xl">🏊</span>
                <h4 className="mt-4 font-semibold text-[#345B4A]">
                  Piscinas y jacuzzis
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                  Espacios para refrescarse y disfrutar del clima de Girardot.
                </p>
              </div>

              <div className="rounded-3xl bg-white/60 p-5 sm:p-7">
                <span className="text-3xl">🌿</span>
                <h4 className="mt-4 font-semibold text-[#345B4A]">
                  Naturaleza
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                  Zonas verdes, jardines y sendero ecológico.
                </p>
              </div>

              <div className="rounded-3xl bg-white/60 p-5 sm:p-7">
                <span className="text-3xl">🛏️</span>
                <h4 className="mt-4 font-semibold text-[#345B4A]">
                  Habitaciones
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                  Opciones de alojamiento con aire acondicionado y Wi-Fi.
                </p>
              </div>

              <div className="rounded-3xl bg-[#F0E1CE] p-5 sm:p-7">
                <span className="text-3xl">🍽️</span>
                <h4 className="mt-4 font-semibold text-[#345B4A]">
                  Restaurante
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#527D6D]">
                  Instalaciones de restaurante y espacios para compartir.
                </p>
              </div>

            </div>
          </div>

          {/* Segunda fotografía: jacuzzi */}
          <div className="mt-16 grid gap-8 overflow-hidden rounded-[2rem] bg-[#F0E1CE] p-5 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-12">

            <div className="overflow-hidden rounded-3xl">
              <img
                src="https://cdn-zen.readytotrip.com/t/1024x768/content/d5/2c/d52c707d416eff636ce219c49f90336b6ac64669.jpeg"
                alt="Jacuzzi exterior rodeado de vegetación tropical en el Hotel Tocarema"
                className="h-[280px] w-full object-cover sm:h-[400px]"
                loading="lazy"
              />
            </div>

            <div className="py-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#527D6D]">
                Un respiro para los dos
              </p>

              <h3 className="mt-4 text-3xl font-semibold leading-tight text-[#345B4A] sm:text-4xl">
                Menos afán.
                <span className="block">Más momentos juntos.</span>
              </h3>

              <p className="mt-5 leading-7 text-[#527D6D] sm:text-lg sm:leading-8">
                Imaginen dejar por unos días las ocupaciones a un lado,
                disfrutar de un ambiente diferente y dedicar tiempo
                a la persona con quien comparten la vida.
              </p>

              <a
                href="#reserva"
                className="mt-7 inline-flex rounded-full bg-[#345B4A] px-7 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#264737]"
              >
                Quiero vivir PARA DOS
              </a>
            </div>
          </div>

          {/* Ubicación */}
          <div className="mt-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#527D6D]">
              Nos encontramos en
            </p>

            <h3 className="mt-3 text-2xl font-semibold text-[#345B4A] sm:text-3xl">
              Girardot, Cundinamarca
            </h3>

            <p className="mt-3 text-sm text-[#527D6D] sm:text-base">
              Hotel Tocarema · Carrera 5 #19-41
            </p>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Hotel+Tocarema+Girardot"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full border border-[#527D6D]/40 bg-white/40 px-7 py-3 font-semibold text-[#345B4A] transition hover:bg-white/70"
            >
              Ver ubicación en Google Maps ↗
            </a>
          </div>

        </div>
      </section>

      {/* =========================================================
          PRICE
      ========================================================= */}
      <section className="bg-[#f6eee9] px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-black/5 sm:p-12">
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
                  Inversión
                </p>

                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  Todo incluido para ustedes dos.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-slate-600">
                  Tres días, dos noches y una experiencia pensada para que
                  puedan desconectarse de la rutina y volver a conectar.
                </p>

                <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <div>✓ Transporte</div>
                  <div>✓ Hospedaje</div>
                  <div>✓ Alimentación</div>
                  <div>✓ Actividades del campamento</div>
                  <div>✓ Espacios para parejas</div>
                  <div>✓ Experiencia Global Family</div>
                </div>
              </div>

              <div className="text-center md:min-w-[260px]">
                <p className="text-sm text-slate-500">Valor por pareja</p>

                <div className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  $1.500.000
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Todo incluido para los dos
                </p>

                <a
                  href="#reserva"
                  className="mt-6 inline-flex w-full justify-center rounded-full bg-rose-500 px-6 py-4 font-semibold text-white transition hover:bg-rose-600"
                >
                  Reservar ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FORM
      ========================================================= */}
      <section id="reserva" className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
              Primer paso
            </p>

            <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">
              Aparten su lugar
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-slate-600">
              Déjanos sus datos y nos pondremos en contacto contigo para
              continuar con el proceso de inscripción.
            </p>
          </div>

          {enviado ? (
            <div className="mt-12 rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="text-5xl">❤️</div>

              <h3 className="mt-4 text-2xl font-semibold text-green-900">
                ¡Ya tenemos sus datos!
              </h3>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-green-800">
                Gracias por querer vivir esta experiencia. Muy pronto nos
                pondremos en contacto contigo para continuar con la
                inscripción.
              </p>

              <a
                href={whatsappLink(
                  "Hola, acabamos de registrarnos para el Campamento de Parejas 2026 y queremos continuar con el proceso."
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Continuar por WhatsApp
              </a>
            </div>
          ) : (
            <form
              onSubmit={enviarFormulario}
              className="mt-12 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nombre1"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nombre de la persona 1
                  </label>

                  <input
                    id="nombre1"
                    value={nombre1}
                    onChange={(e) => setNombre1(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nombre2"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nombre de la persona 2
                  </label>

                  <input
                    id="nombre2"
                    value={nombre2}
                    onChange={(e) => setNombre2(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    WhatsApp
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    placeholder="300 123 4567"
                  />
                </div>

                <div>
                  <label
                    htmlFor="anosJuntos"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ¿Cuánto tiempo llevan juntos?
                  </label>

                  <select
                    id="anosJuntos"
                    value={anosJuntos}
                    onChange={(e) => setAnosJuntos(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Menos de 1 año">Menos de 1 año</option>
                    <option value="1 a 3 años">1 a 3 años</option>
                    <option value="4 a 7 años">4 a 7 años</option>
                    <option value="8 a 15 años">8 a 15 años</option>
                    <option value="Más de 15 años">Más de 15 años</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="tipoAsistente"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ¿Cómo conocieron el campamento?
                  </label>

                  <select
                    id="tipoAsistente"
                    value={tipoAsistente}
                    onChange={(e) => setTipoAsistente(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Global Family">
                      Global Family
                    </option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Amigos o familiares">
                      Amigos o familiares
                    </option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="requerimientos"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ¿Hay algo que debamos saber?
                  </label>

                  <textarea
                    id="requerimientos"
                    value={requerimientos}
                    onChange={(e) => setRequerimientos(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    placeholder="Alimentación, necesidades especiales, preguntas, etc."
                  />
                </div>
              </div>

              <label className="mt-6 flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={aceptaDatos}
                  onChange={(e) => setAceptaDatos(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />

                <span>
                  Acepto el tratamiento de mis datos personales para recibir
                  información relacionada con el Campamento de Parejas.
                </span>
              </label>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="mt-7 w-full rounded-full bg-rose-500 px-6 py-4 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviando ? "Enviando..." : "Quiero apartar mi cupo"}
              </button>

              <p className="mt-4 text-center text-xs text-slate-400">
                Precio: $1.500.000 por pareja · Incluye transporte,
                hospedaje y alimentación.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">
              Preguntas frecuentes
            </p>

            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Antes de reservar
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {[
              {
                q: "¿El precio es por persona o por pareja?",
                a: "$1.500.000 es el valor total para una pareja.",
              },
              {
                q: "¿Qué incluye el valor?",
                a: "Incluye transporte, hospedaje, alimentación y la experiencia del campamento.",
              },
              {
                q: "¿Dónde será el campamento?",
                a: "Nos hospedaremos en el Hotel Tocarema, en Girardot, Cundinamarca.",
              },
              {
                q: "¿Cuándo es?",
                a: "Del viernes 16 al domingo 18 de octubre de 2026.",
              },
              {
                q: "¿Tenemos que ser miembros de Global Family?",
                a: "No. El campamento está pensado para parejas que quieran vivir esta experiencia y fortalecer su relación.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-[#fffaf7] p-5"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="text-xl text-rose-500 transition group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-rose-600 px-6 py-20 text-white sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-100">
            16 — 18 de octubre · Girardot
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Regálense estos tres días.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-rose-50">
            Porque su relación también merece tiempo, atención y un espacio
            para volver a conectar.
          </p>

          <a
            href="#reserva"
            className="mt-9 inline-flex rounded-full bg-white px-8 py-4 font-semibold text-rose-600 shadow-lg transition hover:bg-rose-50"
          >
            Quiero reservar mi cupo
          </a>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-slate-950 px-6 py-10 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-white">Global Family</p>
            <p className="mt-1 text-sm">
              Campamento de Parejas · 2026
            </p>
          </div>

          <div className="text-sm">
            Hotel Tocarema · Girardot, Cundinamarca
          </div>
        </div>
      </footer>
    </main>
  );
}