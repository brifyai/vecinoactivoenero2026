import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProjects, createProject, voteProject, joinAsVolunteer, addProjectUpdate, updateProjectStatus } from '../store/slices/projectsSlice';
import { selectProjects, selectProjectsLoading, selectProjectsByNeighborhood, selectProjectsByStatus, selectProjectsByCategory } from '../store/selectors/projectsSelectors';
import { selectUser } from '../store/selectors/authSelectors';

export const useReduxProjects = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const projects = useSelector(selectProjects);
  const loading = useSelector(selectProjectsLoading);

  useEffect(() => { dispatch(loadProjects()); }, [dispatch]);

  return {
    projects, loading,
    createProject: useCallback((projectData) => dispatch(createProject({ projectData, user })).unwrap(), [dispatch, user]),
    voteProject: useCallback((projectId) => dispatch(voteProject({ projectId, user })).unwrap(), [dispatch, user]),
    joinAsVolunteer: useCallback((projectId) => dispatch(joinAsVolunteer({ projectId, user })).unwrap(), [dispatch, user]),
    addProjectUpdate: useCallback((projectId, updateData) => dispatch(addProjectUpdate({ projectId, updateData, user })).unwrap(), [dispatch, user]),
    updateProjectStatus: useCallback((projectId, newStatus) => dispatch(updateProjectStatus({ projectId, newStatus, user })).unwrap(), [dispatch, user]),
    getProjectsByNeighborhood: useCallback((neighborhoodId) => selectProjectsByNeighborhood({ projects: { projects } }, neighborhoodId), [projects]),
    getProjectsByStatus: useCallback((status) => selectProjectsByStatus({ projects: { projects } }, status), [projects]),
    getProjectsByCategory: useCallback((category) => selectProjectsByCategory({ projects: { projects } }, category), [projects]),
    refreshProjects: useCallback(() => dispatch(loadProjects()), [dispatch])
  };
};
