# Epic 1D - Quick Testing Guide

## 🎯 How to Test the New Advanced Resource Workspace

### Prerequisites
- Dev server running on http://localhost:3000
- Logged in as ADMIN role

---

## Quick Test Flow (10 minutes)

### Step 1: Navigate to Course Editor
```
1. Go to http://localhost:3000/admin/courses
2. Click "Workplace Safety Fundamentals" card
3. Click "Lessons" tab
```

### Step 2: Open Resource Workspace
```
4. Click "Manage" button on "Introduction to Workplace Safety" lesson
5. ✅ You should see:
   - Main workspace area with existing resource cards
   - Sidebar on right with lesson summary
   - Resource counts by type
   - "Preview Lesson" button
```

### Step 3: Test Batch Upload
```
6. Click "+ Add Resource" button
7. Upload tab should be selected by default
8. Drag and drop 2-3 images onto the dropzone
   OR click the dropzone and select multiple files
9. ✅ You should see:
   - Progress bars for each file
   - Success toast: "X file(s) uploaded successfully"
   - New resource cards appear with thumbnails
   - Sidebar counts update immediately
```

### Step 4: Test Link Resource
```
10. Click "+ Add Resource" again
11. Click "Link" tab
12. Enter:
    - Title: "OSHA Safety Guidelines"
    - URL: "https://www.osha.gov"
13. Click "Save"
14. ✅ Link resource card appears with hostname preview
```

### Step 5: Test Text Resource
```
15. Click "+ Add Resource"
16. Click "Text" tab
17. Enter:
    - Title: "Safety Tips"
    - Content: "Always wear appropriate PPE..."
18. Click "Save"
19. ✅ Text resource card appears with content preview
```

### Step 6: Test Drag-and-Drop Reordering
```
20. Hover over the 6-dot drag handle on any resource card
21. Cursor should change to grab/grabbing
22. Drag a card to a new position
23. ✅ Card moves, order updates
24. Refresh page
25. ✅ Order persists
```

### Step 7: Test Inline Title Editing
```
26. Click on any resource card title
27. ✅ Title becomes editable input
28. Type new text
29. Press Enter or click outside
30. ✅ Title saves (sidebar shows "Saving..." then "Saved")
```

### Step 8: Test Text Content Editing
```
31. Find a text resource card
32. Click "Expand to edit"
33. ✅ Textarea appears with content
34. Edit the text
35. Click outside (blur)
36. ✅ Content saves
37. Click "Collapse"
```

### Step 9: Test Preview Lesson Modal
```
38. Click "Preview Lesson" button in sidebar
39. ✅ Modal opens showing:
    - All resources in order
    - Numbered sequence (#1, #2, etc.)
    - Resource previews (images, videos, etc.)
    - Full text content for text resources
    - Metadata for each
40. Click "Close"
```

### Step 10: Test Delete
```
41. Click the trash icon on any resource card
42. Confirm deletion
43. ✅ Resource disappears
44. ✅ Sidebar counts update
45. ✅ If uploaded file, check /public/uploads - file should be deleted
```

### Step 11: Test Manager Read-Only
```
46. Open browser console (F12)
47. Run:
    localStorage.setItem('mockUser', JSON.stringify({
      id:'usr_003',
      name:'Carlos Gomez',
      email:'carlos@upkeep.co',
      role:'MANAGER',
      siteId:'site_001',
      departmentId:'dept_003'
    }))
48. Refresh page
49. Navigate to same lesson
50. ✅ You should see:
    - Read-only banner at top
    - No "+ Add Resource" button
    - No drag handles on cards
    - Clicking title shows text but not editable
    - No delete/replace buttons
    - "Preview Lesson" still works
```

---

## ✅ Expected Results

### Resource Cards
- Clean, modern card design
- Preview thumbnails for images
- Video players for videos  
- PDF icons with filenames
- Link hostnames displayed
- Text content snippets

### Metadata Display
- Resource type badge
- File name, size, MIME type (for uploads)
- "Updated X time ago" timestamp
- Video duration (if set)

### Drag-and-Drop
- Smooth dragging animation
- Visual feedback (shadow, scale)
- Order persists on refresh
- Keyboard support (Space/Arrows/Space)

### Inline Editing
- Click to edit
- Auto-focus and select
- Blur to save
- Enter to save (single-line)
- ESC to cancel
- Immediate save feedback

### Batch Upload
- Multiple file selection
- Individual progress bars
- Auto-detect type from MIME
- Auto-generate title from filename
- Success/error toasts

### Sidebar Summary
- Live count updates
- Duration calculation (videos only)
- Preview button always available
- Save indicator

### Manager Permissions
- Everything read-only
- Banner message
- No mutating actions
- Preview still works

---

## 🐛 Troubleshooting

### Upload doesn't work
- Check browser console for errors
- Check terminal for `[Upload API]` logs
- Verify file type matches (image/video/pdf)
- Try a smaller file first

### Drag-drop doesn't work
- Check if Manager role (drag disabled)
- Try keyboard (Space to pick up, arrows to move)
- Refresh page and try again

### Inline edit doesn't save
- Check browser console for errors
- Verify not in Manager mode
- Check sidebar for "Saving..." indicator

### Preview modal empty
- Check if resources actually exist
- Try refreshing page
- Check browser console

### Counts don't update
- Refresh page
- Check browser console for subscription errors

---

## 📊 Performance Notes

**Expected Load Times:**
- Page load: < 2s
- Upload 3 images: 2-5s (depending on file sizes)
- Drag-drop reorder: Instant
- Inline edit save: < 500ms
- Preview modal open: Instant

**Browser Support:**
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support

---

## 🎉 Success Criteria

After testing, you should have:
- [ ] At least 5 resources in a lesson (mix of types)
- [ ] Reordered resources successfully
- [ ] Edited at least 2 titles inline
- [ ] Edited text content inline
- [ ] Viewed preview modal
- [ ] Verified Manager read-only mode
- [ ] Deleted a resource successfully
- [ ] Uploaded at least 2 files in batch
- [ ] No errors in browser console
- [ ] No errors in terminal

---

**Ready to test!** 🚀

Navigate to: http://localhost:3000/admin/courses

For issues, check:
- Browser Console (F12 → Console tab)
- Terminal (where `npm run dev` is running)
- Network tab (for upload failures)

