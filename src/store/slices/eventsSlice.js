import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper para crear eventos de ejemplo
const createSampleEvents = (userId) => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  return [
    {
      id: Date.now(),
      name: 'Feria Vecinal de Primavera',
      slug: 'feria-vecinal-primavera',
      title: 'Feria Vecinal de Primavera',
      description: 'Únete a nuestra feria vecinal con emprendedores locales, comida, música en vivo y actividades para toda la familia.',
      date: nextWeek.toISOString().split('T')[0],
      time: '10:00',
      location: 'Plaza del Barrio',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop',
      createdBy: userId,
      attendees: [userId],
      interested: [],
      category: 'Comunitario',
      privacy: 'public',
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 1,
      name: 'Limpieza Comunitaria del Parque',
      slug: 'limpieza-comunitaria-parque',
      title: 'Limpieza Comunitaria del Parque',
      description: 'Ayúdanos a mantener nuestro parque limpio y hermoso. Trae guantes y bolsas, nosotros ponemos el café y las ganas.',
      date: nextMonth.toISOString().split('T')[0],
      time: '09:00',
      location: 'Parque Central',
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=250&fit=crop',
      createdBy: userId,
      attendees: [userId],
      interested: [],
      category: 'Medio Ambiente',
      privacy: 'public',
      createdAt: new Date().toISOString()
    }
  ];
};

// Async Thunks
export const loadEvents = createAsyncThunk(
  'events/loadEvents',
  async (userId, { rejectWithValue }) => {
    try {
      let allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      
      // Si no hay eventos, crear algunos de ejemplo
      if (allEvents.length === 0 && userId) {
        allEvents = createSampleEvents(userId);
        localStorage.setItem('events', JSON.stringify(allEvents));
      }
      
      const userEvents = allEvents.filter(event => 
        event.attendees?.includes(userId) || event.createdBy === userId
      );
      
      return { allEvents, userEvents };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async ({ eventData, userId }, { rejectWithValue }) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      
      // Generar slug único
      const baseSlug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (allEvents.some(e => e.slug === slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const newEvent = {
        id: Date.now(),
        title: eventData.title,
        slug: slug,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        image: eventData.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop',
        createdBy: userId,
        attendees: [userId],
        interested: [],
        category: eventData.category || 'General',
        privacy: eventData.privacy || 'public',
        createdAt: new Date().toISOString()
      };

      allEvents.push(newEvent);
      localStorage.setItem('events', JSON.stringify(allEvents));
      
      return newEvent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rsvpEvent = createAsyncThunk(
  'events/rsvpEvent',
  async ({ eventId, userId, status }, { rejectWithValue }) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const eventIndex = allEvents.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        throw new Error('Evento no encontrado');
      }

      // Inicializar arrays si no existen
      if (!allEvents[eventIndex].attendees) allEvents[eventIndex].attendees = [];
      if (!allEvents[eventIndex].interested) allEvents[eventIndex].interested = [];

      // Remover de todas las listas primero
      allEvents[eventIndex].attendees = allEvents[eventIndex].attendees.filter(id => id !== userId);
      allEvents[eventIndex].interested = allEvents[eventIndex].interested.filter(id => id !== userId);

      // Agregar según el nuevo estado
      if (status === 'going') {
        allEvents[eventIndex].attendees.push(userId);
      } else if (status === 'interested') {
        allEvents[eventIndex].interested.push(userId);
      }

      localStorage.setItem('events', JSON.stringify(allEvents));
      
      return { eventId, event: allEvents[eventIndex], status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, updates, userId }, { rejectWithValue }) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const eventIndex = allEvents.findIndex(e => e.id === eventId);

      if (eventIndex === -1) {
        throw new Error('Evento no encontrado');
      }

      // Verificar que el usuario es el creador
      if (allEvents[eventIndex].createdBy !== userId) {
        throw new Error('No tienes permisos para editar este evento');
      }

      allEvents[eventIndex] = {
        ...allEvents[eventIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('events', JSON.stringify(allEvents));
      return allEvents[eventIndex];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const event = allEvents.find(e => e.id === eventId);

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      if (event.createdBy !== userId) {
        throw new Error('Solo el creador puede eliminar el evento');
      }

      const filtered = allEvents.filter(e => e.id !== eventId);
      localStorage.setItem('events', JSON.stringify(filtered));
      
      return { eventId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    allEvents: [],
    myEvents: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Events
      .addCase(loadEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.allEvents = action.payload.allEvents;
        state.myEvents = action.payload.userEvents;
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.fulfilled, (state, action) => {
        state.allEvents.push(action.payload);
        state.myEvents.push(action.payload);
      })
      // RSVP Event
      .addCase(rsvpEvent.fulfilled, (state, action) => {
        const { eventId, event, status } = action.payload;
        const eventIndex = state.allEvents.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          state.allEvents[eventIndex] = event;
        }
        
        // Actualizar myEvents
        const myEventIndex = state.myEvents.findIndex(e => e.id === eventId);
        if (status === 'going' || status === 'interested') {
          if (myEventIndex === -1) {
            state.myEvents.push(event);
          } else {
            state.myEvents[myEventIndex] = event;
          }
        } else if (status === 'not-going' && myEventIndex !== -1) {
          state.myEvents = state.myEvents.filter(e => e.id !== eventId);
        }
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const eventIndex = state.allEvents.findIndex(e => e.id === action.payload.id);
        if (eventIndex !== -1) {
          state.allEvents[eventIndex] = action.payload;
        }
        const myEventIndex = state.myEvents.findIndex(e => e.id === action.payload.id);
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex] = action.payload;
        }
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.allEvents = state.allEvents.filter(e => e.id !== action.payload.eventId);
        state.myEvents = state.myEvents.filter(e => e.id !== action.payload.eventId);
      });
  }
});

export const { clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
