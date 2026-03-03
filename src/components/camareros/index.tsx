import { logger } from '../../utils/logger';
import { useState, useMemo, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { CamarerosProps, FormData } from './types';
import { exportarAExcel as exportarAExcelUtil, importarDesdeExcel as importarDesdeExcelUtil } from './camareroExcelUtils';
import { CamareroStats } from './CamareroStats';
import { CamareroForm } from './CamareroForm';
import { CamarerosList } from './CamarerosList';

export function Camareros({ camareros, setCamareros, pedidos = [], coordinadores = [], baseUrl, publicAnonKey, cargarDatos }: CamarerosProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCamarero, setEditingCamarero] = useState<any>(null);
  const [activeFormTab, setActiveFormTab] = useState('general');
  const [verApercibidos, setVerApercibidos] = useState(false);

  // Estados para calendario avanzado
  const [selectedCamarero, setSelectedCamarero] = useState<any>(null);
  const [showCalendario, setShowCalendario] = useState(false);

  // Estado formulario disponibilidad
  const [modoDisponibilidad, setModoDisponibilidad] = useState('unica'); // 'unica', 'rango', 'semanal'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([]);
  const [tipoDisponibilidad, setTipoDisponibilidad] = useState('disponible');

  const initialFormState: FormData = {
    codigo: '',
    tipoPerfil: 'CAM',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    especialidades: [],
    experiencia: '',
    coordinadorId: '',
    comentarios: '',
    idiomas: [],
    otrosIdiomas: '',
    certificaciones: [],
    otrasCertificaciones: '',
    disponibilidad: [],
    estado: 'activo'
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);

  // --- Generación de Código Automático ---
  const generarCodigo = (tipoPerfil = formData.tipoPerfil) => {
    if (editingCamarero) return;

    const maxNum = camareros.reduce((max, c) => {
      if (c.codigo && c.codigo.startsWith(tipoPerfil)) {
        const num = parseInt(c.codigo.replace(tipoPerfil, ''));
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);

    const nextCode = `${tipoPerfil}${String(maxNum + 1).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, codigo: nextCode, tipoPerfil }));
  };

  useEffect(() => {
    if (showForm && !editingCamarero) generarCodigo(formData.tipoPerfil);
  }, [showForm, camareros, formData.tipoPerfil]);

  // --- Métricas ---
  const metricas = useMemo(() => {
    const hoy = new Date();
    const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    const activos = camareros.filter(c => c.estado !== 'apercibido');
    const totalActivos = activos.length;
    const totalApercibidos = camareros.filter(c => c.estado === 'apercibido').length;

    const noDisponiblesIds = new Set(
      activos
        .filter(c => c.disponibilidad?.some(d => d.fecha === hoyStr && d.tipo === 'no-disponible'))
        .map(c => c.id)
    );

    const pedidosHoy = pedidos.filter(p => p.diaEvento === hoyStr);
    const asignadosIds = new Set();
    pedidosHoy.forEach(p => {
      if (p.asignaciones) p.asignaciones.forEach(a => asignadosIds.add(a.camareroId));
    });

    const ocupadosOIndisponibles = new Set([...noDisponiblesIds, ...asignadosIds]);
    const enReserva = totalActivos - ocupadosOIndisponibles.size;

    return {
      total: totalActivos,
      apercibidos: totalApercibidos,
      reserva: Math.max(0, enReserva),
      noDisponibles: noDisponiblesIds.size,
      valoracion: "4.8"
    };
  }, [camareros, pedidos]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingCamarero(null);
    setShowForm(false);
    setActiveFormTab('general');
  };

  // --- Helpers de Formulario ---
  const toggleListValue = (field: string, value: string) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(value)) return { ...prev, [field]: list.filter(item => item !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  const toggleDiaSemana = (diaIndex: number) => {
    setDiasSeleccionados(prev => {
      if (prev.includes(diaIndex)) return prev.filter(d => d !== diaIndex);
      return [...prev, diaIndex];
    });
  };

  // --- Gestión de Disponibilidad Avanzada ---
  const generarFechas = () => {
    const fechasGeneradas: any[] = [];
    const horarioStr = (horaInicio && horaFin) ? `${horaInicio} - ${horaFin}` : '';

    const start = new Date(fechaInicio);

    if (modoDisponibilidad === 'unica') {
      if (!fechaInicio) return [];
      const fechaStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      fechasGeneradas.push({
        fecha: fechaStr,
        tipo: tipoDisponibilidad,
        horario: horarioStr
      });
    } else {
      // Rango o Semanal
      if (!fechaInicio || !fechaFin) return [];
      const end = new Date(fechaFin);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (modoDisponibilidad === 'semanal') {
          if (!diasSeleccionados.includes(d.getDay())) continue;
        }

        const fechaStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        fechasGeneradas.push({
          fecha: fechaStr,
          tipo: tipoDisponibilidad,
          horario: horarioStr
        });
      }
    }
    return fechasGeneradas;
  };

  const agregarDisponibilidad = async () => {
    if (!selectedCamarero) return;
    const nuevasFechas = generarFechas();
    if (nuevasFechas.length === 0) {
      alert("Por favor completa las fechas requeridas");
      return;
    }

    const disponibilidadActual = selectedCamarero.disponibilidad || [];

    const fechasNuevasSet = new Set(nuevasFechas.map(f => f.fecha));
    const disponibilidadFiltrada = disponibilidadActual.filter(d => !fechasNuevasSet.has(d.fecha));

    const disponibilidadFinal = [...disponibilidadFiltrada, ...nuevasFechas];

    try {
      const response = await fetch(`${baseUrl}/camareros/${selectedCamarero.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ ...selectedCamarero, disponibilidad: disponibilidadFinal })
      });
      if (response.ok) {
        await cargarDatos();
        setFechaInicio('');
        setFechaFin('');
        setDiasSeleccionados([]);
        setHoraInicio('');
        setHoraFin('');
      }
    } catch (error) { logger.error(String(error)); }
  };

  const eliminarDisponibilidad = async (fecha: string) => {
    if (!selectedCamarero) return;
    const disponibilidad = selectedCamarero.disponibilidad.filter(d => d.fecha !== fecha);
    try {
      const response = await fetch(`${baseUrl}/camareros/${selectedCamarero.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ ...selectedCamarero, disponibilidad })
      });
      if (response.ok) {
        await cargarDatos();
        setSelectedCamarero({ ...selectedCamarero, disponibilidad });
      }
    } catch (error) { logger.error(String(error)); }
  };

  // --- Operaciones CRUD Camarero ---
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido) {
      alert('Por favor completa nombre y apellido');
      return;
    }

    const endpoint = editingCamarero ? `${baseUrl}/camareros/${editingCamarero.id}` : `${baseUrl}/camareros`;
    const method = editingCamarero ? 'PUT' : 'POST';
    const body = editingCamarero ? { ...editingCamarero, ...formData } : formData;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (result.success) {
        await cargarDatos();
        resetForm();
      }
    } catch (error) { logger.error('Error:', error); }
  };

  const editarCamarero = (camarero: any) => {
    setFormData({
      codigo: camarero.codigo || '',
      tipoPerfil: camarero.tipoPerfil || 'CAM',
      nombre: camarero.nombre,
      apellido: camarero.apellido,
      telefono: camarero.telefono,
      email: camarero.email,
      especialidades: camarero.especialidades || [],
      experiencia: camarero.experiencia || '',
      coordinadorId: camarero.coordinadorId || '',
      comentarios: camarero.comentarios || '',
      idiomas: camarero.idiomas || [],
      otrosIdiomas: camarero.otrosIdiomas || '',
      certificaciones: camarero.certificaciones || [],
      otrasCertificaciones: camarero.otrasCertificaciones || '',
      disponibilidad: camarero.disponibilidad || [],
      estado: camarero.estado || 'activo'
    });
    setEditingCamarero(camarero);
    setShowForm(true);
  };

  const eliminarCamarero = async (id: any) => {
    if (!window.confirm('¿Eliminar camarero permanentemente?')) return;
    try {
      const response = await fetch(`${baseUrl}/camareros/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` }
      });
      if (response.ok) {
        await cargarDatos();
        if (selectedCamarero?.id === id) setSelectedCamarero(null);
      }
    } catch (error) { logger.error(String(error)); }
  };

  const toggleApercibido = async (camarero: any) => {
    const nuevoEstado = camarero.estado === 'apercibido' ? 'activo' : 'apercibido';
    try {
      const response = await fetch(`${baseUrl}/camareros/${camarero.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...camarero, estado: nuevoEstado })
      });
      if (response.ok) await cargarDatos();
    } catch (error) { logger.error(String(error)); }
  };

  const listaCamareros = camareros
    .filter(c => verApercibidos ? c.estado === 'apercibido' : (c.estado !== 'apercibido' || !c.estado))
    .sort((a, b) => {
      if (a.codigo && b.codigo) return a.codigo.localeCompare(b.codigo);
      return a.numero - b.numero;
    });

  // --- Funciones de Exportación e Importación Excel ---
  const exportarAExcel = () => exportarAExcelUtil(camareros);

  const importarDesdeExcel = async (event: any) =>
    importarDesdeExcelUtil(event, camareros, baseUrl, publicAnonKey, cargarDatos);

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header y Botones Superiores */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Camareros</h2>
          <p className="text-gray-500 text-sm">Administra tu equipo, habilidades y disponibilidad.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setVerApercibidos(!verApercibidos)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border shadow-sm ${
              verApercibidos
                ? 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
                : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {verApercibidos ? 'Volver a Activos' : `Apercibidos (${metricas.apercibidos})`}
          </button>
          {!verApercibidos && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Perfil
            </button>
          )}
        </div>
      </div>

      {/* Métricas (Solo visibles en modo Activos) */}
      {!verApercibidos ? (
        <CamareroStats
          metricas={metricas}
          exportarAExcel={exportarAExcel}
          importarDesdeExcel={importarDesdeExcel}
        />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
          <div>
            <h3 className="text-amber-800 font-bold text-lg">Ranking de Apercibidos</h3>
            <p className="text-amber-700 text-sm">Estos camareros no aparecerán en las listas de asignación hasta que sean reactivados.</p>
          </div>
        </div>
      )}

      {/* Formulario Modal */}
      <CamareroForm
        showForm={showForm}
        editingCamarero={editingCamarero}
        activeFormTab={activeFormTab}
        setActiveFormTab={setActiveFormTab}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        toggleListValue={toggleListValue}
        coordinadores={coordinadores}
        generarCodigo={generarCodigo}
      />

      {/* Lista de Camareros */}
      <CamarerosList
        listaCamareros={listaCamareros}
        verApercibidos={verApercibidos}
        selectedCamarero={selectedCamarero}
        setSelectedCamarero={setSelectedCamarero}
        showCalendario={showCalendario}
        setShowCalendario={setShowCalendario}
        coordinadores={coordinadores}
        editarCamarero={editarCamarero}
        eliminarCamarero={eliminarCamarero}
        toggleApercibido={toggleApercibido}
        modoDisponibilidad={modoDisponibilidad}
        setModoDisponibilidad={setModoDisponibilidad}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        horaInicio={horaInicio}
        setHoraInicio={setHoraInicio}
        horaFin={horaFin}
        setHoraFin={setHoraFin}
        diasSeleccionados={diasSeleccionados}
        toggleDiaSemana={toggleDiaSemana}
        tipoDisponibilidad={tipoDisponibilidad}
        setTipoDisponibilidad={setTipoDisponibilidad}
        agregarDisponibilidad={agregarDisponibilidad}
        eliminarDisponibilidad={eliminarDisponibilidad}
      />
    </div>
  );
}
