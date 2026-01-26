import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../services/storageService';
import { showErrorToast } from '../utils/sweetalert';

export function useUserProfileData(identifier, currentUser, isPage, isGroup, isEvent, isProject, isHelp, isResource) {
  const [profileUser, setProfileUser] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    const loadProfileData = () => {
      if (isPage) {
        const pages = storageService.getPages();
        const foundPage = pages.find(p => p.slug === identifier || p.id === parseInt(identifier));

        if (foundPage) {
          setPageData(foundPage);
          setProfileUser({
            id: foundPage.id,
            name: foundPage.name,
            username: foundPage.slug,
            email: foundPage.email,
            avatar: foundPage.image || foundPage.avatar,
            bio: foundPage.description || `Página: ${foundPage.name}`,
            isPage: true
          });
        } else {
          showErrorToast('Página no encontrada');
          navigate('/paginas');
        }
      } else if (isGroup) {
        const groups = storageService.getGroups();
        const foundGroup = groups.find(g => g.slug === identifier || g.id === parseInt(identifier));

        if (foundGroup) {
          setProfileUser({
            id: foundGroup.id,
            name: foundGroup.name,
            username: foundGroup.slug,
            email: foundGroup.description,
            avatar: foundGroup.image,
            bio: `Grupo: ${foundGroup.name}`,
            members: foundGroup.members,
            isGroup: true
          });
        } else {
          showErrorToast('Grupo no encontrado');
          navigate('/grupos');
        }
      } else if (isEvent) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const foundEvent = events.find(e => e.slug === identifier);

        if (foundEvent) {
          const eventDate = new Date(foundEvent.date);
          setProfileUser({
            id: foundEvent.id,
            name: foundEvent.title,
            username: foundEvent.slug,
            email: foundEvent.location,
            avatar: foundEvent.image,
            bio: `Evento: ${foundEvent.title}`,
            date: eventDate.toLocaleDateString('es-CL'),
            time: eventDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
            attendees: foundEvent.attendees,
            isEvent: true
          });
        } else {
          showErrorToast('Evento no encontrado');
          navigate('/app/eventos');
        }
      } else if (isProject) {
        const projects = JSON.parse(localStorage.getItem('communityProjects') || '[]');
        const foundProject = projects.find(p => p.slug === identifier);

        if (foundProject) {
          setProfileUser({
            id: foundProject.id,
            name: foundProject.title,
            username: foundProject.slug,
            email: foundProject.category,
            avatar: foundProject.creatorAvatar,
            bio: foundProject.description,
            status: foundProject.status,
            votes: foundProject.votes,
            volunteers: foundProject.volunteers,
            budget: foundProject.budget,
            creatorName: foundProject.creatorName,
            neighborhoodName: foundProject.neighborhoodName,
            isProject: true
          });
        } else {
          showErrorToast('Proyecto no encontrado');
          navigate('/proyectos');
        }
      } else if (isHelp) {
        const helpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const foundHelp = helpRequests.find(h => h.slug === identifier);

        if (foundHelp) {
          setProfileUser({
            id: foundHelp.id,
            name: foundHelp.title,
            username: foundHelp.slug,
            email: foundHelp.type,
            avatar: foundHelp.requesterAvatar,
            bio: foundHelp.description,
            status: foundHelp.status,
            urgency: foundHelp.urgency,
            location: foundHelp.location,
            offers: foundHelp.offers,
            requesterName: foundHelp.requesterName,
            neighborhoodName: foundHelp.neighborhoodName,
            isHelp: true
          });
        } else {
          showErrorToast('Solicitud de ayuda no encontrada');
          navigate('/solicitudes-ayuda');
        }
      } else if (isResource) {
        const sharedResources = JSON.parse(localStorage.getItem('sharedResources') || '[]');
        const foundResource = sharedResources.find(r => r.slug === identifier);

        if (foundResource) {
          setProfileUser({
            id: foundResource.id,
            name: foundResource.name,
            username: foundResource.slug,
            email: foundResource.category,
            avatar: foundResource.ownerAvatar,
            bio: foundResource.description,
            condition: foundResource.condition,
            maxLoanDays: foundResource.maxLoanDays,
            requiresDeposit: foundResource.requiresDeposit,
            depositAmount: foundResource.depositAmount,
            totalLoans: foundResource.totalLoans,
            isAvailable: foundResource.isAvailable,
            ownerName: foundResource.ownerName,
            neighborhoodName: foundResource.neighborhoodName,
            isResource: true
          });
        } else {
          showErrorToast('Recurso no encontrado');
          navigate('/recursos-compartidos');
        }
      } else {
        // Buscar usuario
        if (currentUser?.username === identifier) {
          setProfileUser(currentUser);
          setLoading(false);
          return;
        }
        
        const users = storageService.getUsers();
        const foundUser = users.find(u => 
          u.username === identifier || 
          u.name.toLowerCase().replace(/\s+/g, '') === identifier
        );

        if (foundUser) {
          setProfileUser(foundUser);
        }
      }
      setLoading(false);
    };

    loadProfileData();
  }, [identifier, currentUser, navigate, isPage, isGroup, isEvent, isProject, isHelp, isResource]);

  return {
    profileUser,
    pageData,
    loading
  };
}