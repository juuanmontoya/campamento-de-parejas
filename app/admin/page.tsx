"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Preinscripcion = {
  id: string;
  nombre_persona_1: string;
  nombre_persona_2: string;
  whatsapp: string;
  tipo_asistente: string | null;
  anos_juntos: string | null;
  requerimientos: string | null;
  acepta_datos: boolean;
  estado: string;
  estado_pago: string;
  valor_total: number;
  valor_pagado: number;
  notas_admin: string | null;
  created_at: string;
};

type Pago = {
  id: string;
  preinscripcion_id: string;
  valor: number;
  metodo_pago: string;
  fecha_pago: string;
  referencia: string | null;
  notas: string | null;
  comprobante_path: string | null;
  created_at: string;
};

const estados = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "pendiente_pago", label: "Pendiente de pago" },
  { value: "confirmado", label: "Confirmado" },
  { value: "cancelado", label: "Cancelado" },
];

const estadosPago = [
  { value: "pendiente", label: "Pendiente" },
  { value: "abono", label: "Abono" },
  { value: "pagado", label: "Pagado" },
];

const metodosPago = [
  { value: "efectivo", label: "Efectivo" },
  { value: "nequi", label: "Nequi" },
  { value: "transferencia", label: "Transferencia" },
  { value: "daviplata", label: "Daviplata" },
  { value: "otro", label: "Otro" },
];

function fechaHoyInput() {
  return new Date().toLocaleDateString("sv-SE");
}

export default function AdminPage() {
  const router = useRouter();

  const [preinscripciones, setPreinscripciones] = useState<
    Preinscripcion[]
  >([]);

  const [pagos, setPagos] = useState<Pago[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPago, setFiltroPago] = useState("todos");

  const [parejaSeleccionada, setParejaSeleccionada] =
    useState<Preinscripcion | null>(null);

  const [notas, setNotas] = useState("");

  const [cargando, setCargando] = useState(true);
  const [verificandoSesion, setVerificandoSesion] =
    useState(true);

  const [cargandoPagos, setCargandoPagos] =
    useState(false);

  const [guardandoNotas, setGuardandoNotas] =
    useState(false);

  const [guardandoPago, setGuardandoPago] =
    useState(false);

  const [error, setError] = useState("");

  const [mostrarFormularioPago, setMostrarFormularioPago] =
    useState(false);

  const [comprobante, setComprobante] =
    useState<File | null>(null);

  const [abriendoComprobante, setAbriendoComprobante] =
    useState<string | null>(null);

  const [nuevoPago, setNuevoPago] = useState({
    valor: "",
    metodo_pago: "nequi",
    fecha_pago: fechaHoyInput(),
    referencia: "",
    notas: "",
  });

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    setVerificandoSesion(false);
    cargarPreinscripciones();
  }

  async function cargarPreinscripciones() {
    setCargando(true);
    setError("");

    const { data, error } = await supabase
      .from("preinscripciones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(
        "No pudimos cargar las preinscripciones."
      );
      setCargando(false);
      return;
    }

    setPreinscripciones(data || []);
    setCargando(false);
  }

  async function cargarPagos(preinscripcionId: string) {
    setCargandoPagos(true);

    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .eq(
        "preinscripcion_id",
        preinscripcionId
      )
      .order("fecha_pago", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      alert("No pudimos cargar el historial de pagos.");
      setCargandoPagos(false);
      return;
    }

    setPagos(data || []);
    setCargandoPagos(false);
  }

  async function cambiarEstado(
    id: string,
    nuevoEstado: string
  ) {
    const { error } = await supabase
      .from("preinscripciones")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("No pudimos actualizar el estado.");
      return;
    }

    setPreinscripciones((actuales) =>
      actuales.map((item) =>
        item.id === id
          ? {
              ...item,
              estado: nuevoEstado,
            }
          : item
      )
    );

    if (parejaSeleccionada?.id === id) {
      setParejaSeleccionada({
        ...parejaSeleccionada,
        estado: nuevoEstado,
      });
    }
  }

  async function actualizarResumenPago(
    preinscripcionId: string
  ) {
    const { data, error } = await supabase
      .from("pagos")
      .select("valor")
      .eq(
        "preinscripcion_id",
        preinscripcionId
      );

    if (error) {
      console.error(error);
      return;
    }

    const totalPagado = (data || []).reduce(
      (total, pago) =>
        total + Number(pago.valor),
      0
    );

    const pareja =
      preinscripciones.find(
        (item) =>
          item.id === preinscripcionId
      );

    if (!pareja) return;

    let nuevoEstadoPago = "pendiente";

    if (totalPagado >= pareja.valor_total) {
      nuevoEstadoPago = "pagado";
    } else if (totalPagado > 0) {
      nuevoEstadoPago = "abono";
    }

    const { error: errorUpdate } =
      await supabase
        .from("preinscripciones")
        .update({
          valor_pagado: totalPagado,
          estado_pago: nuevoEstadoPago,
        })
        .eq("id", preinscripcionId);

    if (errorUpdate) {
      console.error(errorUpdate);
      return;
    }

    setPreinscripciones((actuales) =>
      actuales.map((item) =>
        item.id === preinscripcionId
          ? {
              ...item,
              valor_pagado: totalPagado,
              estado_pago: nuevoEstadoPago,
            }
          : item
      )
    );

    if (
      parejaSeleccionada?.id ===
      preinscripcionId
    ) {
      setParejaSeleccionada({
        ...parejaSeleccionada,
        valor_pagado: totalPagado,
        estado_pago: nuevoEstadoPago,
      });
    }
  }

  async function agregarPago() {
    if (!parejaSeleccionada) return;

    const valor = Number(nuevoPago.valor);

    if (!valor || valor <= 0) {
      alert("Ingresa un valor de pago válido.");
      return;
    }

    const totalActual =
      parejaSeleccionada.valor_pagado;

    const saldoActual = Math.max(
      parejaSeleccionada.valor_total -
        totalActual,
      0
    );

    if (valor > saldoActual) {
      alert(
        `El pago no puede superar el saldo pendiente de ${formatoDinero(
          saldoActual
        )}.`
      );
      return;
    }

    if (comprobante) {
      const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];

      if (!tiposPermitidos.includes(comprobante.type)) {
        alert(
          "El comprobante debe ser una imagen JPG, PNG, WEBP o un PDF."
        );
        return;
      }

      const maximoBytes = 5 * 1024 * 1024;

      if (comprobante.size > maximoBytes) {
        alert(
          "El comprobante no puede pesar más de 5 MB."
        );
        return;
      }
    }

    setGuardandoPago(true);

    /*
     * Primero creamos el pago.
     * Luego usamos el ID generado por Supabase
     * para construir la ruta del comprobante.
     */
    const { data: pagoCreado, error } =
      await supabase
        .from("pagos")
        .insert({
          preinscripcion_id:
            parejaSeleccionada.id,
          valor,
          metodo_pago:
            nuevoPago.metodo_pago,
          fecha_pago:
            nuevoPago.fecha_pago,
          referencia:
            nuevoPago.referencia.trim() ||
            null,
          notas:
            nuevoPago.notas.trim() ||
            null,
        })
        .select()
        .single();

    if (error || !pagoCreado) {
      console.error(error);
      alert("No pudimos registrar el pago.");
      setGuardandoPago(false);
      return;
    }

    /*
     * Si no hay comprobante, terminamos normalmente.
     */
    if (!comprobante) {
      setNuevoPago({
        valor: "",
        metodo_pago: "nequi",
        fecha_pago: fechaHoyInput(),
        referencia: "",
        notas: "",
      });

      setComprobante(null);
      setMostrarFormularioPago(false);

      await cargarPagos(
        parejaSeleccionada.id
      );

      await actualizarResumenPago(
        parejaSeleccionada.id
      );

      setGuardandoPago(false);
      return;
    }

    /*
     * Construimos una extensión segura.
     */
    const nombreOriginal =
      comprobante.name.toLowerCase();

    let extension = "jpg";

    if (nombreOriginal.endsWith(".png")) {
      extension = "png";
    } else if (
      nombreOriginal.endsWith(".webp")
    ) {
      extension = "webp";
    } else if (
      nombreOriginal.endsWith(".pdf")
    ) {
      extension = "pdf";
    } else if (
      nombreOriginal.endsWith(".jpeg")
    ) {
      extension = "jpeg";
    }

    const rutaComprobante =
      `${parejaSeleccionada.id}/${pagoCreado.id}.${extension}`;

    const { error: errorUpload } =
      await supabase.storage
        .from("comprobantes-pago")
        .upload(
          rutaComprobante,
          comprobante,
          {
            cacheControl: "3600",
            upsert: false,
            contentType:
              comprobante.type,
          }
        );

    if (errorUpload) {
      console.error(errorUpload);

      /*
       * Si falla la subida, eliminamos el pago
       * para no dejar un pago sin comprobante.
       */
      await supabase
        .from("pagos")
        .delete()
        .eq("id", pagoCreado.id);

      alert(
        "El pago no pudo guardar el comprobante. El registro del pago fue cancelado."
      );

      setGuardandoPago(false);
      return;
    }

    /*
     * Guardamos solamente la ruta del archivo
     * en la tabla pagos.
     */
    const { error: errorPath } =
      await supabase
        .from("pagos")
        .update({
          comprobante_path:
            rutaComprobante,
        })
        .eq("id", pagoCreado.id);

    if (errorPath) {
      console.error(errorPath);

      await supabase.storage
        .from("comprobantes-pago")
        .remove([rutaComprobante]);

      await supabase
        .from("pagos")
        .delete()
        .eq("id", pagoCreado.id);

      alert(
        "No pudimos asociar el comprobante al pago."
      );

      setGuardandoPago(false);
      return;
    }

    setNuevoPago({
      valor: "",
      metodo_pago: "nequi",
      fecha_pago: fechaHoyInput(),
      referencia: "",
      notas: "",
    });

    setComprobante(null);
    setMostrarFormularioPago(false);

    await cargarPagos(
      parejaSeleccionada.id
    );

    await actualizarResumenPago(
      parejaSeleccionada.id
    );

    setGuardandoPago(false);
  }

  async function verComprobante(
    pago: Pago
  ) {
    if (!pago.comprobante_path) return;

    setAbriendoComprobante(pago.id);

    const { data, error } =
      await supabase.storage
        .from("comprobantes-pago")
        .createSignedUrl(
          pago.comprobante_path,
          60 * 60
        );

    if (error || !data?.signedUrl) {
      console.error(error);
      alert(
        "No pudimos abrir el comprobante."
      );
      setAbriendoComprobante(null);
      return;
    }

    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setAbriendoComprobante(null);
  }

  async function eliminarPago(
    pago: Pago
  ) {
    const confirmar = window.confirm(
      `¿Seguro que quieres eliminar este pago de ${formatoDinero(
        pago.valor
      )}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("pagos")
      .delete()
      .eq("id", pago.id);

    if (error) {
      console.error(error);
      alert("No pudimos eliminar el pago.");
      return;
    }

    /*
     * Si tenía comprobante, eliminamos también
     * el archivo de Storage.
     */
    if (pago.comprobante_path) {
      const { error: errorStorage } =
        await supabase.storage
          .from("comprobantes-pago")
          .remove([
            pago.comprobante_path,
          ]);

      if (errorStorage) {
        console.error(errorStorage);
        console.warn(
          "El pago fue eliminado, pero el comprobante quedó en Storage."
        );
      }
    }

    setPagos((actuales) =>
      actuales.filter(
        (item) => item.id !== pago.id
      )
    );

    if (parejaSeleccionada) {
      await actualizarResumenPago(
        parejaSeleccionada.id
      );
    }
  }

  async function guardarNotas() {
    if (!parejaSeleccionada) return;

    setGuardandoNotas(true);

    const { error } = await supabase
      .from("preinscripciones")
      .update({
        notas_admin: notas,
      })
      .eq("id", parejaSeleccionada.id);

    if (error) {
      console.error(error);
      alert("No pudimos guardar las notas.");
      setGuardandoNotas(false);
      return;
    }

    setPreinscripciones((actuales) =>
      actuales.map((item) =>
        item.id === parejaSeleccionada.id
          ? {
              ...item,
              notas_admin: notas,
            }
          : item
      )
    );

    setParejaSeleccionada({
      ...parejaSeleccionada,
      notas_admin: notas,
    });

    setGuardandoNotas(false);
  }

  async function abrirPareja(
    item: Preinscripcion
  ) {
    setParejaSeleccionada(item);
    setNotas(item.notas_admin || "");
    setPagos([]);
    setMostrarFormularioPago(false);
    setComprobante(null);

    await cargarPagos(item.id);
  }

  function cerrarFicha() {
    setParejaSeleccionada(null);
    setNotas("");
    setPagos([]);
    setMostrarFormularioPago(false);
    setComprobante(null);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function formatearFecha(
    fecha: string
  ) {
    return new Date(fecha).toLocaleDateString(
      "es-CO",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatearFechaInput(
    fecha: string
  ) {
    return new Date(
      `${fecha}T12:00:00`
    ).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatoDinero(
    valor: number
  ) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor);
  }

  function nombreMetodoPago(
    metodo: string
  ) {
    return (
      metodosPago.find(
        (item) =>
          item.value === metodo
      )?.label || metodo
    );
  }

  const preinscripcionesFiltradas =
    useMemo(() => {
      const texto =
        busqueda.trim().toLowerCase();

      return preinscripciones.filter(
        (item) => {
          const coincideBusqueda =
            !texto ||
            item.nombre_persona_1
              .toLowerCase()
              .includes(texto) ||
            item.nombre_persona_2
              .toLowerCase()
              .includes(texto) ||
            item.whatsapp
              .toLowerCase()
              .includes(texto);

          const coincideEstado =
            filtroEstado === "todos" ||
            item.estado ===
              filtroEstado;

          const coincidePago =
            filtroPago === "todos" ||
            item.estado_pago ===
              filtroPago;

          return (
            coincideBusqueda &&
            coincideEstado &&
            coincidePago
          );
        }
      );
    }, [
      preinscripciones,
      busqueda,
      filtroEstado,
      filtroPago,
    ]);

  const totalRecaudado =
    preinscripciones.reduce(
      (total, item) =>
        total + item.valor_pagado,
      0
    );

  if (verificandoSesion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Verificando acceso...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-purple-700">
              Global Family
            </p>

            <h1 className="text-2xl font-bold text-slate-900">
              Campamento de Parejas
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Panel de preinscripciones
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={
                cargarPreinscripciones
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ↻ Actualizar
            </button>

            <button
              onClick={cerrarSesion}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* RESUMEN */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Total parejas
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {preinscripciones.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Nuevos
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-700">
              {
                preinscripciones.filter(
                  (item) =>
                    item.estado ===
                    "nuevo"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Pendientes de pago
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {
                preinscripciones.filter(
                  (item) =>
                    item.estado_pago !==
                    "pagado"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Confirmados
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                preinscripciones.filter(
                  (item) =>
                    item.estado ===
                    "confirmado"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Recaudado
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatoDinero(
                totalRecaudado
              )}
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            <div>
              <label
                htmlFor="busqueda"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Buscar pareja
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  id="busqueda"
                  type="text"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(
                      e.target.value
                    )
                  }
                  placeholder="Nombre o número de WhatsApp..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="filtroEstado"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Estado
              </label>

              <select
                id="filtroEstado"
                value={filtroEstado}
                onChange={(e) =>
                  setFiltroEstado(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              >
                <option value="todos">
                  Todos los estados
                </option>

                {estados.map(
                  (estado) => (
                    <option
                      key={estado.value}
                      value={estado.value}
                    >
                      {estado.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="filtroPago"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Pago
              </label>

              <select
                id="filtroPago"
                value={filtroPago}
                onChange={(e) =>
                  setFiltroPago(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              >
                <option value="todos">
                  Todos los pagos
                </option>

                {estadosPago.map(
                  (estado) => (
                    <option
                      key={estado.value}
                      value={estado.value}
                    >
                      {estado.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-800">
                {
                  preinscripcionesFiltradas.length
                }
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-800">
                {preinscripciones.length}
              </span>{" "}
              parejas
            </p>

            {(busqueda ||
              filtroEstado !==
                "todos" ||
              filtroPago !==
                "todos") && (
              <button
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado(
                    "todos"
                  );
                  setFiltroPago(
                    "todos"
                  );
                }}
                className="text-sm font-medium text-purple-700 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLA */}
        {cargando ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Cargando preinscripciones...
            </p>
          </div>
        ) : preinscripcionesFiltradas.length ===
          0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              No encontramos parejas
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Prueba cambiando la búsqueda o
              los filtros.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pareja
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      WhatsApp
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Información
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pago
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {preinscripcionesFiltradas.map(
                    (item) => {
                      const pendiente =
                        Math.max(
                          item.valor_total -
                            item.valor_pagado,
                          0
                        );

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-5">
                            <p className="font-semibold text-slate-900">
                              {
                                item.nombre_persona_1
                              }
                            </p>

                            <p className="text-sm text-slate-500">
                              {
                                item.nombre_persona_2
                              }
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <a
                              href={`https://wa.me/${item.whatsapp.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-green-600 hover:underline"
                            >
                              {
                                item.whatsapp
                              }
                            </a>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm text-slate-700">
                              {item.tipo_asistente ||
                                "—"}
                            </p>

                            <p className="text-sm text-slate-500">
                              {item.anos_juntos
                                ? `${item.anos_juntos} juntos`
                                : "—"}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <select
                              value={
                                item.estado
                              }
                              onChange={(e) =>
                                cambiarEstado(
                                  item.id,
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            >
                              {estados.map(
                                (
                                  estado
                                ) => (
                                  <option
                                    key={
                                      estado.value
                                    }
                                    value={
                                      estado.value
                                    }
                                  >
                                    {
                                      estado.label
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </td>

                          <td className="px-5 py-5">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-700">
                                {
                                  estadosPago.find(
                                    (
                                      estado
                                    ) =>
                                      estado.value ===
                                      item.estado_pago
                                  )
                                    ?.label ||
                                  item.estado_pago
                                }
                              </p>

                              <p className="text-xs text-slate-500">
                                Pagado:{" "}
                                {formatoDinero(
                                  item.valor_pagado
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                Falta:{" "}
                                {formatoDinero(
                                  pendiente
                                )}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <button
                              onClick={() =>
                                abrirPareja(
                                  item
                                )
                              }
                              className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800"
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* FICHA DE PAREJA */}
      {parejaSeleccionada && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Cerrar"
            onClick={cerrarFicha}
            className="absolute inset-0 h-full w-full bg-slate-900/40 backdrop-blur-sm"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            {/* CABECERA */}
            <div className="border-b px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Ficha de pareja
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    {
                      parejaSeleccionada.nombre_persona_1
                    }{" "}
                    &{" "}
                    {
                      parejaSeleccionada.nombre_persona_2
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Preinscritos el{" "}
                    {formatearFecha(
                      parejaSeleccionada.created_at
                    )}
                  </p>
                </div>

                <button
                  onClick={cerrarFicha}
                  className="rounded-full p-2 text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* WHATSAPP */}
              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  WhatsApp
                </p>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">
                    {
                      parejaSeleccionada.whatsapp
                    }
                  </p>

                  <a
                    href={`https://wa.me/${parejaSeleccionada.whatsapp.replace(
                      /\D/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              </div>

              {/* INFORMACIÓN */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Información
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Tipo
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {
                        parejaSeleccionada.tipo_asistente ||
                        "—"
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Años juntos
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {
                        parejaSeleccionada.anos_juntos ||
                        "—"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* ESTADO */}
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Estado
                </label>

                <select
                  value={
                    parejaSeleccionada.estado
                  }
                  onChange={(e) =>
                    cambiarEstado(
                      parejaSeleccionada.id,
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                >
                  {estados.map((estado) => (
                    <option
                      key={estado.value}
                      value={estado.value}
                    >
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* PAGOS */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Pagos
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Historial de abonos de esta
                      pareja
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setMostrarFormularioPago(
                        !mostrarFormularioPago
                      )
                    }
                    className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800"
                  >
                    {mostrarFormularioPago
                      ? "Cancelar"
                      : "+ Agregar pago"}
                  </button>
                </div>

                {/* RESUMEN */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatoDinero(
                        parejaSeleccionada.valor_total
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs text-green-600">
                      Pagado
                    </p>

                    <p className="mt-1 text-sm font-bold text-green-700">
                      {formatoDinero(
                        parejaSeleccionada.valor_pagado
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs text-amber-600">
                      Pendiente
                    </p>

                    <p className="mt-1 text-sm font-bold text-amber-700">
                      {formatoDinero(
                        Math.max(
                          parejaSeleccionada.valor_total -
                            parejaSeleccionada.valor_pagado,
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>

                {/* FORMULARIO NUEVO PAGO */}
                {mostrarFormularioPago && (
                  <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-5">
                    <h4 className="font-semibold text-slate-900">
                      Registrar nuevo pago
                    </h4>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Valor
                        </label>

                        <input
                          type="number"
                          min="1"
                          max={Math.max(
                            parejaSeleccionada.valor_total -
                              parejaSeleccionada.valor_pagado,
                            0
                          )}
                          value={
                            nuevoPago.valor
                          }
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              valor: e.target.value,
                            })
                          }
                          placeholder="Ej: 175000"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Método de pago
                        </label>

                        <select
                          value={
                            nuevoPago.metodo_pago
                          }
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              metodo_pago:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        >
                          {metodosPago.map(
                            (metodo) => (
                              <option
                                key={
                                  metodo.value
                                }
                                value={
                                  metodo.value
                                }
                              >
                                {
                                  metodo.label
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Fecha del pago
                        </label>

                        <input
                          type="date"
                          value={
                            nuevoPago.fecha_pago
                          }
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              fecha_pago:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Referencia
                        </label>

                        <input
                          type="text"
                          value={
                            nuevoPago.referencia
                          }
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              referencia:
                                e.target.value,
                            })
                          }
                          placeholder="Ej: últimos 4 dígitos, número de comprobante..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      {/* COMPROBANTE */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Comprobante
                        </label>

                        <label
                          htmlFor="comprobante"
                          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-purple-400 hover:bg-purple-50"
                        >
                          <span className="text-2xl">
                            📎
                          </span>

                          <span className="mt-2 text-sm font-semibold text-slate-700">
                            {comprobante
                              ? "Cambiar comprobante"
                              : "Seleccionar comprobante"}
                          </span>

                          <span className="mt-1 text-xs text-slate-400">
                            JPG, PNG, WEBP o PDF · Máx.
                            5 MB
                          </span>

                          <input
                            id="comprobante"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const archivo =
                                e.target.files?.[0] ||
                                null;

                              setComprobante(
                                archivo
                              );
                            }}
                          />
                        </label>

                        {comprobante && (
                          <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-700">
                                {
                                  comprobante.name
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                {(
                                  comprobante.size /
                                  1024 /
                                  1024
                                ).toFixed(
                                  2
                                )}{" "}
                                MB
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setComprobante(
                                  null
                                )
                              }
                              className="ml-3 rounded-lg px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Nota
                        </label>

                        <textarea
                          rows={3}
                          value={
                            nuevoPago.notas
                          }
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              notas:
                                e.target.value,
                            })
                          }
                          placeholder="Ej: Abono inicial..."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                        />
                      </div>

                      <button
                        onClick={agregarPago}
                        disabled={
                          guardandoPago
                        }
                        className="w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {guardandoPago
                          ? "Registrando pago..."
                          : "Registrar pago"}
                      </button>
                    </div>
                  </div>
                )}

                {/* HISTORIAL */}
                <div className="mt-4">
                  {cargandoPagos ? (
                    <div className="rounded-xl bg-slate-50 p-6 text-center">
                      <p className="text-sm text-slate-500">
                        Cargando pagos...
                      </p>
                    </div>
                  ) : pagos.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                      <p className="text-sm font-medium text-slate-600">
                        Todavía no hay pagos
                        registrados.
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Cuando reciban el primer
                        abono aparecerá aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pagos.map((pago) => (
                        <div
                          key={pago.id}
                          className="rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-bold text-green-700">
                                {formatoDinero(
                                  pago.valor
                                )}
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-700">
                                {nombreMetodoPago(
                                  pago.metodo_pago
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatearFechaInput(
                                  pago.fecha_pago
                                )}
                              </p>
                            </div>

                            <button
                              onClick={() =>
                                eliminarPago(
                                  pago
                                )
                              }
                              className="rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          </div>

                          {pago.comprobante_path && (
                            <button
                              onClick={() =>
                                verComprobante(
                                  pago
                                )
                              }
                              disabled={
                                abriendoComprobante ===
                                pago.id
                              }
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {abriendoComprobante ===
                              pago.id
                                ? "Abriendo..."
                                : "📎 Ver comprobante"}
                            </button>
                          )}

                          {pago.referencia && (
                            <div className="mt-3 border-t border-slate-100 pt-3">
                              <p className="text-xs text-slate-400">
                                Referencia
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                {
                                  pago.referencia
                                }
                              </p>
                            </div>
                          )}

                          {pago.notas && (
                            <div className="mt-3">
                              <p className="text-xs text-slate-400">
                                Nota
                              </p>

                              <p className="mt-1 text-sm text-slate-600">
                                {pago.notas}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Estado de pago
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {estadosPago.find(
                      (estado) =>
                        estado.value ===
                        parejaSeleccionada.estado_pago
                    )?.label ||
                      parejaSeleccionada.estado_pago}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Este estado se calcula automáticamente
                    según el total de pagos registrados.
                  </p>
                </div>
              </div>

              {/* REQUERIMIENTOS */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Requerimientos
                </h3>

                <div className="mt-3 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                    {
                      parejaSeleccionada.requerimientos ||
                      "No registraron requerimientos."
                    }
                  </p>
                </div>
              </div>

              {/* NOTAS ADMIN */}
              <div>
                <label
                  htmlFor="notas"
                  className="text-sm font-semibold text-slate-900"
                >
                  Notas administrativas
                </label>

                <p className="mt-1 text-xs text-slate-400">
                  Estas notas son internas y no las
                  verá la pareja.
                </p>

                <textarea
                  id="notas"
                  value={notas}
                  onChange={(e) =>
                    setNotas(
                      e.target.value
                    )
                  }
                  rows={6}
                  placeholder="Ej: Le escribimos por WhatsApp. Está pendiente de confirmar..."
                  className="mt-3 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                />

                <button
                  onClick={guardarNotas}
                  disabled={
                    guardandoNotas
                  }
                  className="mt-3 w-full rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardandoNotas
                    ? "Guardando..."
                    : "Guardar notas"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}