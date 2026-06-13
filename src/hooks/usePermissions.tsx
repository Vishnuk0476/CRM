import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();
  
  const role = user?.role || '';
  const isSuper = role === 'super_admin' || role === 'owner';
  const isAdmin = isSuper || role === 'admin';
  const isManager = role === 'operations_manager' || role === 'manager';
  const isAccounts = role === 'accounts_executive' || role === 'accountant';
  const isConsultant = role === 'consultant' || role === 'salesperson';
  const isFieldExec = role === 'field_executive';
  const isSocialMedia = role === 'social_media' || role === 'digital_marketing';

  // Parse JSON permissions if available
  let parsedPerms: Record<string, string> = {};
  if (user && (user as any).permissions) {
    const p = (user as any).permissions;
    if (typeof p === 'string') {
      try { parsedPerms = JSON.parse(p); } catch {}
    } else if (typeof p === 'object') {
      parsedPerms = p;
    }
  }

  // Helper to strictly check granular access, falling back to role defaults if not explicitly set
  const checkAccess = (module: string, level: 'read' | 'write' | 'execute', fallback: boolean) => {
    if (isSuper) return true;
    
    // Explicitly denied
    if (parsedPerms[module] === 'none') return false;
    
    // Explicitly granted a level
    if (parsedPerms[module]) {
      const userLevel = parsedPerms[module];
      if (level === 'read') return userLevel === 'read' || userLevel === 'write' || userLevel === 'execute';
      if (level === 'write') return userLevel === 'write' || userLevel === 'execute';
      if (level === 'execute') return userLevel === 'execute';
      return false;
    }
    
    // No explicit permission set in JSON -> use role fallback
    return fallback;
  };

  // Role hierarchy and module access
  return {
    isAdmin,
    isManager,
    isAccounts,
    isConsultant,
    isFieldExec,
    isSocialMedia,
    
    // General check for the new CRMLayout checks
    checkAccess,
    
    // Generic fallback for older components that use canEdit / canDelete without specific modules
    canDelete: isSuper || isAdmin,
    canEdit: isSuper || isAdmin || isManager,

    // Leads & Cases
    canViewLeads: checkAccess('leads', 'read', isSuper || isAdmin || isManager || isConsultant),
    canEditLeads: checkAccess('leads', 'write', isSuper || isAdmin || isManager || isConsultant),
    canAssignLeads: checkAccess('leads', 'write', isSuper || isAdmin || isManager),
    
    canViewCases: checkAccess('cases', 'read', isSuper || isAdmin || isManager || isConsultant || isAccounts),
    canEditCases: checkAccess('cases', 'write', isSuper || isAdmin || isManager || isConsultant),
    
    // Surveys
    canViewSurveys: checkAccess('surveys', 'read', isSuper || isAdmin || isManager || isConsultant || isFieldExec),
    canEditSurveys: checkAccess('surveys', 'write', isSuper || isAdmin || isManager || isConsultant || isFieldExec),
    
    // Finance / Invoices / Expenses
    canViewFinance: checkAccess('invoices', 'read', isSuper || isAdmin || isManager || isAccounts),
    canEditFinance: checkAccess('invoices', 'write', isSuper || isAdmin || isAccounts),
    
    // Operations / Consignments / Orders
    canViewOperations: checkAccess('orders', 'read', isSuper || isAdmin || isManager),
    canEditOperations: checkAccess('orders', 'write', isSuper || isAdmin || isManager),
    
    // Attendance
    canViewAttendance: checkAccess('attendance', 'read', isSuper || isAdmin || isManager),
    
    // Social Media
    canManageSocial: checkAccess('social', 'write', isSuper || isAdmin || isSocialMedia),
    
    // System Settings
    canManageSettings: checkAccess('settings', 'write', isSuper || isAdmin),
    
    // Utilities
    isGulfNRI: (country: string) => {
      const gulfCountries = ['uae', 'united arab emirates', 'saudi arabia', 'qatar', 'kuwait', 'bahrain', 'oman'];
      return gulfCountries.includes(country?.toLowerCase());
    }
  };
}
