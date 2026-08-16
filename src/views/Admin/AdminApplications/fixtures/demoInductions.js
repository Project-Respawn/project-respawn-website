// Isolated fictional booking; no real person, calendar event, or meeting URL.
export const DEMO_INDUCTION_BOOKING = Object.freeze({
  id: 'IND-DEMO-0001', bookingTypeId: 'booking-type-induction', bookingTypeName: 'Induction', applicantName: 'Taylor Fixture', applicationReference: 'APP-DEMO-BOOKED',
  applicationId: null, pathway: 'Creator Programme', date: '2026-09-18', startTime: '14:00', endTime: '15:00',
  timeZone: 'Europe/London', assignedStaff: 'Riley Staff Demo', status: 'booked', acceptanceOrigin: 'Automatic acceptance',
  meetingState: 'Ready for simulation', adminAttention: 'None', adminAttendees: [], internalNotes: 'Frontend-only induction scheduling fixture.',
  auditEvents: [{ id: 'booking-created', timestamp: '2026-08-01T10:00:00.000Z', action: 'Induction booked', actor: 'System', summary: 'Fictional induction booking prepared.' }],
});

const booking = (id, applicantName, reference, date, startTime, endTime, assignedStaff, status, options = {}) => Object.freeze({ id, bookingTypeId: 'booking-type-induction', bookingTypeName: 'Induction', applicantName, applicationReference: reference, applicationId: null, pathway: 'Creator Programme', date, startTime, endTime, timeZone: 'Europe/London', assignedStaff, status, acceptanceOrigin: options.acceptanceOrigin || 'Admin decision', meetingState: options.meetingState || 'Ready for simulation', adminAttention: assignedStaff === 'Unassigned' ? 'Needs staff' : options.adminAttention || 'None', adminAttendees: options.adminAttendees || [], internalNotes: 'Isolated fictional induction scheduling fixture.', auditEvents: [{ id: `${id}-created`, timestamp: '2026-08-01T09:00:00.000Z', action: 'Induction prepared', actor: 'System', summary: 'Fictional induction record prepared.' }] });
export const DEMO_INDUCTION_BOOKINGS = Object.freeze([
  DEMO_INDUCTION_BOOKING,
  booking('IND-DEMO-0002', 'Jamie Example', 'APP-DEMO-TODAY', '2026-08-16', '10:00', '10:45', 'Sam Staff Fixture', 'booked', { adminAttendees: ['Admin'], acceptanceOrigin: 'Early acceptance' }),
  booking('IND-DEMO-0003', 'Robin Sample', 'APP-DEMO-SAME-DAY', '2026-08-16', '15:30', '16:15', 'Unassigned', 'booked'),
  booking('IND-DEMO-0004', 'Avery Fiction', 'APP-DEMO-PAUSED', '2026-08-21', '11:00', '12:00', 'Riley Staff Demo', 'paused', { adminAttention: 'Admin review required', meetingState: 'Booking paused' }),
  booking('IND-DEMO-0005', 'Quinn Placeholder', 'APP-DEMO-CANCELLED', '2026-08-25', '13:00', '14:00', 'Sam Staff Fixture', 'cancelled', { meetingState: 'Cancelled' }),
  booking('IND-DEMO-0006', 'Sky Demo', 'APP-DEMO-COMPLETE', '2026-08-08', '09:30', '10:15', 'Riley Staff Demo', 'completed', { meetingState: 'Completed' }),
  booking('IND-DEMO-0007', 'River Fixture', 'APP-DEMO-AWAITING', 'Not booked', '—', '—', 'Unassigned', 'invitation-prepared', { meetingState: 'Booking available' }),
]);

export const DEMO_STAFF = Object.freeze(['Riley Staff Demo', 'Sam Staff Fixture', 'Unassigned']);
