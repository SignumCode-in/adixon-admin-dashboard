import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

/**
 * Custom hook to cleanly resolve the active clinic ID scope across the application:
 * 1. If currently inside a route with `/clinics/:clinicId/*`, that clinicId param takes highest priority.
 * 2. If Master Admin on a general view, uses the Topbar Clinic Switcher selection (`selectedClinicId`).
 * 3. If Doctor or Staff, strictly locked to their registered `user.clinic_id`.
 */
export function useActiveClinicScope() {
  const { clinicId: routeClinicId } = useParams();
  const { user, isAdmin } = useAuth();
  const { selectedClinicId } = useClinic();

  // 1. Explicit nested route scope (e.g. /admin/clinics/:clinicId/patients)
  if (routeClinicId && routeClinicId !== 'new') {
    return routeClinicId;
  }

  // 2. Master Admin global switcher scope
  if (isAdmin) {
    return selectedClinicId && selectedClinicId !== 'all' ? selectedClinicId : null;
  }

  // 3. Clinical user fixed clinic scope
  return user?.clinic_id?._id || user?.clinic_id || null;
}
