const BusinessForm = ({ newBusiness, setNewBusiness, businessCategories }) => {
  return (
    <>
      <div className="form-group">
        <label>Categoría</label>
        <select value={newBusiness.category} onChange={(e) => setNewBusiness({...newBusiness, category: e.target.value})}>
          {businessCategories.filter(c => c.value !== 'all').map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Nombre del Negocio</label>
        <input
          type="text"
          value={newBusiness.name}
          onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
          placeholder="Ej: Almacén Don Pedro"
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          value={newBusiness.description}
          onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})}
          placeholder="Describe tu negocio..."
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            value={newBusiness.address}
            onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
            placeholder="Calle y número"
          />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={newBusiness.phone}
            onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={newBusiness.email}
            onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
            placeholder="contacto@negocio.cl"
          />
        </div>
        <div className="form-group">
          <label>WhatsApp</label>
          <input
            type="tel"
            value={newBusiness.whatsapp}
            onChange={(e) => setNewBusiness({...newBusiness, whatsapp: e.target.value})}
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Instagram</label>
          <input
            type="text"
            value={newBusiness.instagram}
            onChange={(e) => setNewBusiness({...newBusiness, instagram: e.target.value})}
            placeholder="@usuario"
          />
        </div>
        <div className="form-group">
          <label>Facebook</label>
          <input
            type="text"
            value={newBusiness.facebook}
            onChange={(e) => setNewBusiness({...newBusiness, facebook: e.target.value})}
            placeholder="facebook.com/pagina"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Rango de Precios</label>
        <select value={newBusiness.priceRange} onChange={(e) => setNewBusiness({...newBusiness, priceRange: e.target.value})}>
          <option value="bajo">$ Económico</option>
          <option value="medio">$$ Moderado</option>
          <option value="alto">$$$ Premium</option>
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={newBusiness.acceptsCards}
            onChange={(e) => setNewBusiness({...newBusiness, acceptsCards: e.target.checked})}
          />
          Acepta tarjetas de crédito/débito
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={newBusiness.hasDelivery}
            onChange={(e) => setNewBusiness({...newBusiness, hasDelivery: e.target.checked})}
          />
          Ofrece servicio de delivery
        </label>
      </div>
    </>
  );
};

export default BusinessForm;