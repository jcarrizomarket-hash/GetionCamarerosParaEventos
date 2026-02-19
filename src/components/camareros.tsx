import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit2, Calendar, Users, UserCheck, UserX, Star, Trash2, AlertTriangle, CheckCircle2, XCircle, Clock, Repeat, CalendarRange, ChevronDown, ChevronUp } from 'lucide-react';

const IDIOMAS = ['Castellano', 'Portugués', 'Catalán', 'Inglés', 'Francés', 'Alemán', 'Italiano'];
const CERTIFICACIONES = ['PRL', 'Manipulación de alimentos', 'Primeros auxilios', 'APPCC', 'RCP'];
const ESPECIALIDADES = ['Coctelería', 'Banquetes', 'Restaurant', 'Buffet', 'VIP'];
const TIPOS_PERFIL = [
  { codigo: 'CAM', label: 'Camarero' },
  { codigo: 'COC', label: 'Cocina' },
  { codigo: 'PIC', label: 'Pica' },
  { codigo: 'AZA', label: 'Azafata' }
];

interface CamarerosProps {
  camareros: any[];
  setCamareros: (camareros: any[]) => void;
  pedidos?: any[];
  coordinadores?: any[];
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
}

export function Camareros({ camareros, setCamareros, pedidos = [], coordinadores = [], baseUrl, publicAnonKey, cargarDatos }: CamarerosProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCamarero, setEditingCamarero] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('general');
  const [verApercibidos, setVerApercibidos] = useState(false);

  // Estados para calendario avanzado
  const [selectedCamarero, setSelectedCamarero] = useState(null);
  const [showCalendario, setShowCalendario] = useState(false);
  
  // Estado formulario disponibilidad
  const [modoDisponibilidad, setModoDisponibilidad] = useState('unica'); // 'unica', 'rango', 'semanal'
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [diasSeleccionados, setDiasSeleccionados] = useState([]); // 0=Domingo, 1=Lunes...
  const [tipoDisponibilidad, setTipoDisponibilidad] = useState('disponible');

  const initialFormState = {
    codigo: '',
    tipoPerfil: 'CAM', // Nuevo campo
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

  const [formData, setFormData] = useState(initialFormState);

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
      // FIX: Calcular valoración real basada en estado del equipo (pendiente sistema de valoraciones real)
      valoracion: totalActivos > 0 ? 'N/A' : '-'
    };
  }, [camareros, pedidos]);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingCamarero(null);
    setShowForm(false);
    setActiveFormTab('general');
  };

  // --- Helpers de Formulario ---
  const toggleListValue = (field, value) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(value)) return { ...prev, [field]: list.filter(item => item !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  const toggleDiaSemana = (diaIndex) => {
    setDiasSeleccionados(prev => {
      if (prev.includes(diaIndex)) return prev.filter(d => d !== diaIndex);
      return [...prev, diaIndex];
    });
  };

  // --- Gestión de Disponibilidad Avanzada ---
  const generarFechas = () => {
    const fechasGeneradas = [];
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
        // Si es semanal, verificar el día de la semana
        if (modoDisponibilidad === 'semanal') {
           // getDay(): 0=Domingo, 1=Lunes.
           // Ajustar según la UI (si la UI usa 1=Lunes, hay que mapear)
           // Aquí asumiremos que diasSeleccionados guarda lo que retorna getDay() (0-6)
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
    
    // Filtrar duplicados (si ya existe fecha, la reemplazamos con la nueva)
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
        // Limpiar formulario disponibilidad
        setFechaInicio('');
        setFechaFin('');
        setDiasSeleccionados([]);
        setHoraInicio('');
        setHoraFin('');
      }
    } catch (error) { console.log(error); }
  };

  const eliminarDisponibilidad = async (fecha) => {
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
    } catch (error) { console.log(error); }
  };

  // --- Operaciones CRUD Camarero ---
  const handleSubmit = async (e) => {
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
    } catch (error) { console.log('Error:', error); }
  };

  const editarCamarero = (camarero) => {
    setFormData({
      codigo: camarero.codigo || '',
      tipoPerfil: camarero.tipoPerfil || 'CAM', // Nuevo campo
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

  const eliminarCamarero = async (id) => {
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
    } catch (error) { console.log(error); }
  };

  const toggleApercibido = async (camarero) => {
    const nuevoEstado = camarero.estado === 'apercibido' ? 'activo' : 'apercibido';
    try {
      const response = await fetch(`${baseUrl}/camareros/${camarero.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...camarero, estado: nuevoEstado })
      });
      if (response.ok) await cargarDatos();
    } catch (error) { console.log(error); }
  };

  const listaCamareros = camareros
    .filter(c => verApercibidos ? c.estado === 'apercibido' : (c.estado !== 'apercibido' || !c.estado))
    .sort((a, b) => {
        if (a.codigo && b.codigo) return a.codigo.localeCompare(b.codigo);
        return a.numero - b.numero;
    });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Activos</p>
              <p className="text-2xl font-bold text-gray-800">{metricas.total}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">En Reserva (Hoy)</p>
              <p className="text-2xl font-bold text-gray-800">{metricas.reserva}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">No Disponibles (Hoy)</p>
              <p className="text-2xl font-bold text-gray-800">{metricas.noDisponibles}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Valoración Equipo</p>
              <p className="text-2xl font-bold text-gray-800">{metricas.valoracion}/5</p>
            </div>
          </div>
        </div>
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
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">
              {editingCamarero ? 'Editar Camarero' : 'Nuevo Camarero'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveFormTab('general')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                activeFormTab === 'general' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveFormTab('habilidades')}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                activeFormTab === 'habilidades' ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Habilidades y Certificaciones
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* TAB GENERAL */}
            {activeFormTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Perfil *</label>
                    <select
                      value={formData.tipoPerfil}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value;
                        setFormData({ ...formData, tipoPerfil: nuevoTipo });
                        if (!editingCamarero) {
                          generarCodigo(nuevoTipo);
                        }
                      }}
                      disabled={!!editingCamarero}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingCamarero ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      required
                    >
                      {TIPOS_PERFIL.map(tipo => (
                        <option key={tipo.codigo} value={tipo.codigo}>{tipo.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                    <input type="text" value={formData.codigo} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coordinador</label>
                    <select
                      value={formData.coordinadorId}
                      onChange={(e) => setFormData({ ...formData, coordinadorId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="coord-empty" value="">Seleccionar...</option>
                      {coordinadores.map(coord => (
                        <option key={coord.id} value={coord.id}>{coord.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                    <input type="text" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                    <div className="flex flex-wrap gap-2">
                       {ESPECIALIDADES.map(esp => (
                        <button key={esp} type="button" onClick={() => toggleListValue('especialidades', esp)} className={`px-3 py-1.5 text-sm rounded-full border ${formData.especialidades.includes(esp) ? 'bg-blue-100 text-blue-700 border-blue-200 font-medium' : 'bg-white text-gray-600 border-gray-200'}`}>{esp}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Años experiencia</label>
                    <input type="number" min="0" value={formData.experiencia} onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                  <textarea value={formData.comentarios} onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" />
                </div>
              </div>
            )}
            {/* TAB HABILIDADES */}
            {activeFormTab === 'habilidades' && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 border-b pb-2">Idiomas</h4>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {IDIOMAS.map(idioma => (
                      <button key={idioma} type="button" onClick={() => toggleListValue('idiomas', idioma)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${formData.idiomas.includes(idioma) ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{idioma}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Otros idiomas..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={formData.otrosIdiomas} onChange={(e) => setFormData({...formData, otrosIdiomas: e.target.value})} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 border-b pb-2">Certificaciones</h4>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {CERTIFICACIONES.map(cert => (
                      <button key={cert} type="button" onClick={() => toggleListValue('certificaciones', cert)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${formData.certificaciones.includes(cert) ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{cert}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Otras certificaciones..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={formData.otrasCertificaciones} onChange={(e) => setFormData({...formData, otrasCertificaciones: e.target.value})} />
                </div>
              </div>
            )}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm">{editingCamarero ? 'Guardar Cambios' : 'Crear Camarero'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Camareros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">
            {verApercibidos ? 'Ranking de Apercibidos' : 'Personal Activo'}
          </h3>
          <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200">
            {listaCamareros.length} registros
          </span>
        </div>

        {listaCamareros.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No hay camareros en esta lista</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listaCamareros.map((camarero) => (
              <div key={camarero.id} className={`p-6 hover:bg-gray-50 transition-colors ${verApercibidos ? 'bg-amber-50/30' : ''}`}>
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Info Principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold font-mono ${verApercibidos ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-800'}`}>
                        {camarero.codigo || `#${camarero.numero}`}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900">{camarero.nombre} {camarero.apellido}</h4>
                      {camarero.coordinadorId && (
                         <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs border border-purple-100">
                           Coord: {coordinadores.find(c => c.id === camarero.coordinadorId)?.nombre || 'Desconocido'}
                         </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Tel:</span> {camarero.telefono}</p>
                      <p><span className="font-medium">Email:</span> {camarero.email}</p>
                      {verApercibidos && camarero.comentarios && (
                         <div className="col-span-2 bg-white p-2 rounded border border-amber-200 mt-2">
                            <span className="font-bold text-amber-800 text-xs">Nota de Apercibimiento / Comentario:</span>
                            <p className="text-gray-700 italic">{camarero.comentarios}</p>
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <div className="flex gap-2">
                       <button
                        onClick={() => {
                          setSelectedCamarero(camarero);
                          setShowCalendario(!showCalendario || selectedCamarero?.id !== camarero.id);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver Disponibilidad"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                      <button onClick={() => editarCamarero(camarero)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => eliminarCamarero(camarero.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleApercibido(camarero)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${
                        camarero.estado === 'apercibido'
                          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {camarero.estado === 'apercibido' ? 'Reactivar' : 'Apercibir'}
                    </button>
                  </div>
                </div>

                {/* Calendario inline con opciones avanzadas */}
                {showCalendario && selectedCamarero?.id === camarero.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 animate-in fade-in bg-white rounded-lg">
                    <div className="flex flex-col xl:flex-row gap-6">
                      
                      {/* PANEL IZQUIERDO: FORMULARIO */}
                      <div className="flex-1 bg-blue-50 p-5 rounded-lg border border-blue-100">
                        <h5 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                           <CalendarRange className="w-5 h-5" />
                           Gestionar Disponibilidad
                        </h5>
                        
                        {/* Selector de Modo */}
                        <div className="flex bg-white rounded-lg p-1 mb-4 shadow-sm">
                          <button onClick={() => setModoDisponibilidad('unica')} className={`flex-1 py-1.5 text-xs font-medium rounded ${modoDisponibilidad === 'unica' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Única</button>
                          <button onClick={() => setModoDisponibilidad('rango')} className={`flex-1 py-1.5 text-xs font-medium rounded ${modoDisponibilidad === 'rango' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Rango</button>
                          <button onClick={() => setModoDisponibilidad('semanal')} className={`flex-1 py-1.5 text-xs font-medium rounded ${modoDisponibilidad === 'semanal' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Semanal</button>
                        </div>

                        <div className="space-y-3">
                           {/* Fechas */}
                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">{modoDisponibilidad === 'unica' ? 'Fecha' : 'Desde'}</label>
                                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                              </div>
                              {modoDisponibilidad !== 'unica' && (
                                <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Hasta</label>
                                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                                </div>
                              )}
                           </div>

                           {/* Días Semanales */}
                           {modoDisponibilidad === 'semanal' && (
                             <div>
                               <label className="block text-xs font-bold text-gray-600 mb-1">Repetir los días</label>
                               <div className="flex justify-between gap-1">
                                 {['D','L','M','X','J','V','S'].map((d, i) => (
                                   <button 
                                     key={i} 
                                     onClick={() => toggleDiaSemana(i)}
                                     className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${diasSeleccionados.includes(i) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-500'}`}
                                   >
                                     {d}
                                   </button>
                                 ))}
                               </div>
                             </div>
                           )}

                           {/* Horario */}
                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Hora Inicio</label>
                                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Hora Fin</label>
                                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                              </div>
                           </div>
                           
                           {/* Tipo */}
                           <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1">Estado</label>
                             <select value={tipoDisponibilidad} onChange={(e) => setTipoDisponibilidad(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                               <option key="disp-disponible" value="disponible">Disponible</option>
                               <option key="disp-no-disponible" value="no-disponible">No Disponible</option>
                             </select>
                           </div>

                           <button onClick={agregarDisponibilidad} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm mt-2">
                             Guardar Disponibilidad
                           </button>
                        </div>
                      </div>
                      
                      {/* PANEL DERECHO: LISTA */}
                      <div className="flex-[2]">
                        <h5 className="font-bold text-gray-800 mb-3 text-sm flex items-center justify-between">
                          <span>Calendario Registrado</span>
                          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Ordenado por fecha</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                          {camarero.disponibilidad && camarero.disponibilidad.length > 0 ? (
                            camarero.disponibilidad
                              .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                              .map((disp, idx) => (
                                <div
                                  key={`${disp.fecha}-${idx}`}
                                  className={`flex flex-col p-2 rounded border relative group ${
                                    disp.tipo === 'disponible'
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-red-50 border-red-200'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className={`text-xs font-bold ${disp.tipo==='disponible' ? 'text-green-800' : 'text-red-800'}`}>
                                      {new Date(disp.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                                    </span>
                                    <button
                                      onClick={() => eliminarDisponibilidad(disp.fecha)}
                                      className="text-gray-400 hover:text-red-600"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                     {disp.horario ? (
                                       <>
                                         <Clock className="w-3 h-3" />
                                         <span>{disp.horario}</span>
                                       </>
                                     ) : (
                                       <span className="italic opacity-50">Todo el día</span>
                                     )}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">No hay disponibilidad registrada</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}