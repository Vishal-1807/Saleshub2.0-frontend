import { useAppSelector } from '../store/hooks';
import { rolePermissions, Resource, Permission } from '../config/permissions';

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  const hasPermission = (resource: Resource, permission: Permission): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role];
    const resourcePermissions = userPermissions[resource];

    if (!resourcePermissions) return false;

    return resourcePermissions.includes(permission);
  };

  const canRead = (resource: Resource): boolean => {
    return hasPermission(resource, 'read');
  };

  const canWrite = (resource: Resource): boolean => {
    return hasPermission(resource, 'write');
  };

  const canCreate = (resource: Resource): boolean => {
    return hasPermission(resource, 'create');
  };

  const canDelete = (resource: Resource): boolean => {
    return hasPermission(resource, 'delete');
  };

  const isReadOnly = (resource: Resource): boolean => {
    return canRead(resource) && !canWrite(resource);
  };

  return {
    hasPermission,
    canRead,
    canWrite,
    canCreate,
    canDelete,
    isReadOnly,
    user,
  };
};
