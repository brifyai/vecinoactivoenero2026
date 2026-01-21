import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const GroupsContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups debe usarse dentro de GroupsProvider');
  }
  return context;
};

export const GroupsProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = () => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    setGroups(allGroups);
    
    const userGroups = allGroups.filter(group =>
      (group.members || []).includes(user.id)
    );
    setMyGroups(userGroups);
  };

  const createGroup = (groupData) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    
    // Generar slug único
    const baseSlug = groupData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (allGroups.some(g => g.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const newGroup = {
      id: Date.now(),
      name: groupData.name,
      slug: slug,
      description: groupData.description,
      image: groupData.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop',
      createdBy: user.id,
      members: [user.id],
      admins: [user.id],
      posts: [],
      privacy: groupData.privacy || 'public', // public, private, secret
      createdAt: new Date().toISOString()
    };

    allGroups.push(newGroup);
    localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
    loadGroups();
    return newGroup;
  };

  const joinGroup = (groupId) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    const groupIndex = allGroups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) return false;

    if (!allGroups[groupIndex].members?.includes(user.id)) {
      allGroups[groupIndex].members = [...(allGroups[groupIndex].members || []), user.id];
      localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
      loadGroups();
      return true;
    }
    return false;
  };

  const leaveGroup = (groupId) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    const groupIndex = allGroups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) return false;

    allGroups[groupIndex].members = (allGroups[groupIndex].members || []).filter(
      id => id !== user.id
    );
    
    localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
    loadGroups();
    return true;
  };

  const postToGroup = (groupId, postData) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    const groupIndex = allGroups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) return null;

    // Verificar que el usuario es miembro
    if (!allGroups[groupIndex].members?.includes(user.id)) {
      return null;
    }

    const newPost = {
      id: Date.now(),
      userId: user.id,
      groupId,
      content: postData.content,
      image: postData.image || null,
      reactions: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    allGroups[groupIndex].posts.unshift(newPost);
    localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
    loadGroups();
    return newPost;
  };

  const getGroupPosts = (groupId) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    const group = allGroups.find(g => g.id === groupId);
    return group?.posts || [];
  };

  const updateGroup = (groupId, updates) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    const groupIndex = allGroups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) return false;

    // Verificar que el usuario es admin
    if (!allGroups[groupIndex].admins?.includes(user.id)) {
      return false;
    }

    allGroups[groupIndex] = {
      ...allGroups[groupIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
    loadGroups();
    return true;
  };

  const deleteGroup = (groupId) => {
    const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
    const group = allGroups.find(g => g.id === groupId);

    if (!group || group.createdBy !== user.id) {
      return false;
    }

    const filtered = allGroups.filter(g => g.id !== groupId);
    localStorage.setItem('friendbook_groups', JSON.stringify(filtered));
    loadGroups();
    return true;
  };

  const searchGroups = (query) => {
    return groups.filter(group =>
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value = {
    groups,
    myGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    postToGroup,
    getGroupPosts,
    updateGroup,
    deleteGroup,
    searchGroups,
    loadGroups
  };

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
};
