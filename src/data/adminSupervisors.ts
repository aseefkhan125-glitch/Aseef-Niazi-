import { AdminSupervisor } from '../types/tracker';

export const DEFAULT_ADMIN_SUPERVISORS: AdminSupervisor[] = [
  {
    id: 'admin-aseef-khan',
    name: 'Officer Aseef Khan',
    email: 'aseefkhan125@gmail.com',
    badgeNumber: 'FIA-9482-PK',
    agency: 'National Cyber Crime Agency & Tactical Surveillance Wing',
    role: 'Super Admin',
    isWatching: true,
    lastActive: Date.now(),
  },
  {
    id: 'admin-patrol-cmd',
    name: 'Inspector R. Tariq',
    email: 'ops.mianwali@police.gov.pk',
    badgeNumber: 'POL-7104-ML',
    agency: 'Mianwali District Police Operations Room',
    role: 'Tactical Dispatcher',
    isWatching: true,
    lastActive: Date.now() - 45000,
  },
];
