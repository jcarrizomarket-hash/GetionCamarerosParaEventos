import { XCircle } from 'lucide-react';
import { IDIOMAS, CERTIFICACIONES, TIPOS_PERFIL } from './types';
import { FormData } from './types';
import { useEspecialidades } from '../../hooks/useEspecialidades';


interface CamareroFormProps {
  showForm: boolean;
  editingCamarero: any;
  activeFormTab: string;
  setActiveFormTab: (tab: string) => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleSubmit: (e: any) => void;
  resetForm: () => void;
  toggleListValue: (field: string, value: string) => void;
  coordinadores: any[];
  generarCodigo: (tipoPerfil: string) => void;
  /** Profile-type options loaded from the DB; falls back to TIPOS_PERFIL */
  roles?: { codigo: string; label: string }[];
  /** Language options loaded from the DB `idiomas` table; falls back to IDIOMAS */
  idiomas?: string[];
}

export function CamareroForm({
  showForm,
  editingCamarero,
  activeFormTab,
  setActiveFormTab,
  formData,
  setFormData,
  handleSubmit,
  resetForm,
  toggleListValue,
  coordinadores,
  generarCodigo,
  roles = TIPOS_PERFIL,
  idiomas = IDIOMAS,
}: CamareroFormProps) {
  const { especialidades } = useEspecialidades();
  if (!showForm) return null;

  return (
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
                  {roles.map(tipo => (
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
                  {especialidades.map(esp => (
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
              <textarea value={formData.comentarios} onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
            </div>
          </div>
        )}
        {/* TAB HABILIDADES */}
        {activeFormTab === 'habilidades' && (
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 border-b pb-2">Idiomas</h4>
              <div className="flex flex-wrap gap-3 mb-3">
                {idiomas.map(idioma => (
                  <button key={idioma} type="button" onClick={() => toggleListValue('idiomas', idioma)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${formData.idiomas.includes(idioma) ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{idioma}</button>
                ))}
              </div>
              <input type="text" placeholder="Otros idiomas..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={formData.otrosIdiomas} onChange={(e) => setFormData({ ...formData, otrosIdiomas: e.target.value })} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 border-b pb-2">Certificaciones</h4>
              <div className="flex flex-wrap gap-3 mb-3">
                {CERTIFICACIONES.map(cert => (
                  <button key={cert} type="button" onClick={() => toggleListValue('certificaciones', cert)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${formData.certificaciones.includes(cert) ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>{cert}</button>
                ))}
              </div>
              <input type="text" placeholder="Otras certificaciones..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" value={formData.otrasCertificaciones} onChange={(e) => setFormData({ ...formData, otrasCertificaciones: e.target.value })} />
            </div>
          </div>
        )}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cancelar</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm">{editingCamarero ? 'Guardar Cambios' : 'Crear Camarero'}</button>
        </div>
      </form>
    </div>
  );
}
