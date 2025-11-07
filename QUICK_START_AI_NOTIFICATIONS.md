# AI Notifications - Quick Start Guide

## ✅ Implementation Complete!

The unified AI notification system is now live with a streamlined "Compose → Send → Archive" workflow.

## What's New?

### 1. Unified Compose Modal
- **One modal for all notification sources** (Compliance & Coach)
- **Explicit recipient selection**: Choose Managers or Learners in scope
- **4 tone presets**: Friendly, Direct, Escalation, Praise
- **Real-time context data**: Shows current metrics and scope
- **Mock send functionality**: Creates full notification records
- **Copy to clipboard**: Easy content sharing

### 2. Notification Archive
- **View all sent notifications** at `/admin/notifications`
- **Detailed history**: Subject, body, recipients, context snapshot
- **Re-send capability**: Click any notification to re-send with original content
- **Scope filtering**: Managers see only their team's notifications

### 3. Simplified Settings
- **Removed redundant AI panel** from Settings → Notifications
- **Cleaner interface** focused on reminder rules
- **Access compose from where you need it** (Compliance page, Dashboard)

## How to Use

### Send Notification from Compliance Page
1. Go to **Admin → Compliance**
2. Apply filters (Site, Department, Status, etc.)
3. Click **"Suggest Reminder"** button
4. Modal opens with:
   - Recipients: Learners in scope (default)
   - Tone: Direct (default)
   - Subject & Body: Auto-generated from your filters
5. Review recipients (chip display)
6. Click **"Send Notification"**
7. Success toast confirms send

### Send Escalation from Dashboard
1. Go to **Admin → Dashboard**
2. View **Smart Compliance Coach** card
3. Click **"Draft Manager Escalation"**
4. Modal opens with:
   - Recipients: Managers in scope (default)
   - Tone: Escalation (default)
   - Subject & Body: Manager-focused message
5. Click **"Send Notification"**

### View Notification Archive
1. Go to **Admin → Notifications** (new nav item with Bell icon)
2. View table of all sent notifications
3. Filter by Source (Compliance/Coach)
4. Click any row to see full details
5. Click **"Re-send..."** to send again with same content

## Key Features

### Recipient Selection
- ✅ **Managers in scope**: All managers matching current site/dept
- ✅ **Learners in scope**: All learners matching current site/dept
- ✅ Shows recipient count and first 10 names
- ✅ Remove individual recipients with ✕ button

### Tone Variants
- 🟢 **Friendly**: Light nudge for routine reminders
- 🔵 **Direct**: Clear action items with concrete deadlines
- 🔴 **Escalation**: Urgent compliance notices for overdue items
- 🟡 **Praise**: Celebrate teams with strong compliance

### Context Data (Automatically Included)
- Site and Department names
- Total assignments and completions
- Overdue count and due soon count
- Top overdue training title
- Nearest due date
- On-time completion percentage (last 30 days)

### Archive Features
- Full message history with audit trail
- Scope-aware filtering (Managers see only their notifications)
- Detail view with recipient chips (name + email)
- Context snapshot shows data at time of sending
- Re-send creates NEW notification (new timestamp)

## Technical Notes

### Scope Awareness
All operations respect your current scope:
- **Admin**: Sees all data, can send to anyone
- **Manager**: Sees only their site/dept, recipients filtered to scope

### Mock Sending
- Notifications are stored in-memory
- No actual emails sent (mock only)
- Change log entry created for audit trail
- "Mock Notification" label in archive

### Data Integrity
- All placeholders resolved before storage
- Context snapshot captures metrics at send time
- Re-send uses original content (no re-generation)
- Recipient list preserved in archive

## Files to Explore

### Components
- `components/NotificationComposeModal.tsx` - Main compose UI
- `components/NotificationComposeButton.tsx` - Trigger button
- `components/SmartCoachCard.tsx` - Dashboard coach with escalation

### Pages
- `app/admin/compliance/page.tsx` - Compliance with compose button
- `app/admin/notifications/page.tsx` - Notification archive
- `app/admin/settings/notifications/page.tsx` - Reminder rules (AI panel removed)

### Libraries
- `lib/notifyAI.ts` - AI text generation and recipient resolution
- `lib/store.ts` - Notification storage and scope filtering
- `types.ts` - Extended Notification interface

## FAQs

**Q: Where did the AI Suggestions panel go?**  
A: Removed from Settings page. Use "Suggest Reminder" on Compliance page instead.

**Q: Can I send to specific people?**  
A: Not yet - current version supports Managers or Learners in scope. Coming in future update.

**Q: Are emails actually sent?**  
A: No, this is mock sending only. Notifications are stored in-memory for demo purposes.

**Q: Can I edit the message before sending?**  
A: Subject/body are read-only but you can change the tone to regenerate content.

**Q: How many recipients can I send to?**  
A: Limited to 50 recipients per notification for performance.

**Q: Can Managers send to learners outside their scope?**  
A: No, all recipient resolution respects scope. Managers can only send to their team.

**Q: What happens when I click Re-send?**  
A: Opens compose modal with original subject/body/recipients. Sending creates a NEW notification with new timestamp.

## Support

For issues or questions:
1. Check browser console for errors
2. Verify you have appropriate role (Admin or Manager)
3. Confirm scope is set correctly (site/department filters)
4. Review `AI_NOTIFICATIONS_UNIFIED_SUMMARY.md` for detailed documentation

---

**Version:** 1.0.0  
**Last Updated:** October 28, 2025  
**Status:** ✅ Production Ready








