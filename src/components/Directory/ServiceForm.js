const ServiceForm = ({ newService, setNewService, serviceCategories }) => {
  return (
    <>
      <div className="form-group">
        <label>Nombre del Servicio</label>
        <input
          type="text"
          value={newService.name}
          onChange={(e) => setNewService({...newService, name: e.target.value})}
          placeholder="Ej: Juan Pérez - Plomería"
        />
      </div>
      <div className="form-group">
        <label>Categoría</label>
        <select
          value={newService.category}
          onChange={(e) => setNewService({...newService, category: e.target.value})}
        >
          {serviceCategories.filter(c => c.value !== 'all').map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea
          value={newService.description}
          onChange={(e) => setNewService({...newService, description: e.target.value})}
          placeholder="Describe los servicios que ofreces..."
          rows="3"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={newService.phone}
            onChange={(e) => setNewService({...newService, phone: e.target.value})}
            placeholder="+56 9 1234 5678"
          />
        </div>
        <div className="form-group">
          <label>Email (Opcional)</label>
          <input
            type="email"
            value={newService.email}
            onChange={(e) => setNewService({...newService, email: e.target.value})}
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Dirección (Opcional)</label>
        <input
          type="text"
          value={newService.address}
          onChange={(e) => setNewService({...newService, address: e.target.value})}
          placeholder="Calle Principal #123"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Tarifa por Hora (Opcional)</label>
          <input
            type="number"
            value={newService.hourlyRate}
            onChange={(e) => setNewService({...newService, hourlyRate: e.target.value})}
            placeholder="15000"
          />
        </div>
        <div className="form-group">
          <label>Disponibilidad</label>
          <select
            value={newService.availability}
            onChange={(e) => setNewService({...newService, availability: e.target.value})}
          >
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="no_disponible">No Disponible</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default ServiceForm;