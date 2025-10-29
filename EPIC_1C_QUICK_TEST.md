# Epic 1C - Quick Testing Guide

## 🎯 How to Test Media Uploads

### Prerequisites
- Dev server running on http://localhost:3000
- Logged in as ADMIN role

### Quick Test Flow (5 minutes)

1. **Navigate to Course Editor**
   - Go to http://localhost:3000/admin/courses
   - Click on "Workplace Safety Fundamentals"
   - Click "Lessons" tab

2. **Select a Lesson**
   - Click "Manage" button on any lesson (e.g., "Introduction to Workplace Safety")
   - Resource panel opens on the right

3. **Test Upload Tab**
   - Click "+ Add" button to open resource form
   - Default tab is "Upload"
   - Select file type: **Image**
   - Click "Choose File" and select a PNG/JPG from your computer
   - Watch progress indicator
   - ✅ Resource should appear with thumbnail preview

4. **Test Link Tab**
   - Click "+ Add" again
   - Click "Link" tab
   - Enter:
     - Title: "OSHA Guidelines"
     - URL: "https://www.osha.gov"
   - Click "Save"
   - ✅ Resource appears with hostname preview

5. **Test Text Tab**
   - Click "+ Add" again
   - Click "Text" tab
   - Enter:
     - Title: "Safety Reminder"
     - Content: "Always wear PPE when operating machinery..."
   - Click "Save"
   - ✅ Resource appears with content snippet

6. **Test Replace**
   - Find the uploaded image resource
   - Click the Upload icon (Replace button)
   - Select a different image
   - ✅ Resource updates with new image

7. **Test Delete**
   - Click the Trash icon on any resource
   - Confirm deletion
   - ✅ Resource disappears
   - ✅ If it was an uploaded file, check `/public/uploads` - file should be gone

8. **Test Metadata Display**
   - Check each resource shows:
     - Type badge (image, video, pdf, link, text)
     - File name (for uploads)
     - File size (for uploads)
     - MIME type (for uploads)

9. **Test Manager Read-Only**
   - Open dev tools console
   - Run: `localStorage.setItem('mockUser', JSON.stringify({id:'usr_003',name:'Carlos Gomez',email:'carlos@upkeep.co',role:'MANAGER',siteId:'site_001',departmentId:'dept_003'}))`
   - Refresh page
   - ✅ Upload/Replace/Delete buttons should be hidden
   - ✅ Drag handles should be hidden
   - ✅ Can still view resources with previews

### File Upload Validation Tests

**Max Size (100 MB)**
- Try uploading a file > 100 MB
- ✅ Should show error alert

**Wrong MIME Type**
- Select "Image" type
- Try uploading a .txt file
- ✅ Should show error (invalid file type)

**Special Characters in Filename**
- Upload a file named: `test@#$%file.png`
- ✅ Should sanitize to: `{uuid}-test____file.png`

### File System Verification

Check files are saved correctly:
```bash
ls -lh /Users/jotygrewal/LMS\ Prototype/public/uploads/
```

Structure should be:
```
uploads/
  2025/
    10/
      {uuid}-filename.png
      {uuid}-filename.jpg
```

### API Endpoint Tests (Optional)

**Test Upload API directly:**
```bash
# Create a test file
echo "test content" > test.txt

# Try to upload (should fail - wrong type)
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.txt" \
  -F "type=image"

# Expected: {"ok":false,"error":"Invalid file type..."}
```

**Test Delete API:**
```bash
curl -X POST http://localhost:3000/api/upload/delete \
  -H "Content-Type: application/json" \
  -d '{"url":"/uploads/2025/10/test.png"}'

# Expected: {"ok":false,"error":"File not found"} (if file doesn't exist)
```

---

## ✅ Success Criteria

After testing, you should have:
- [ ] At least 1 uploaded image showing thumbnail
- [ ] At least 1 video (if you have an MP4/WEBM)
- [ ] At least 1 PDF showing icon
- [ ] At least 1 link resource
- [ ] At least 1 text resource
- [ ] Verified file metadata displays correctly
- [ ] Verified replace functionality works
- [ ] Verified delete removes file from disk
- [ ] Verified Manager role is read-only

---

## 🐛 Common Issues

**"Upload failed" error**
- Check dev server console for errors
- Verify file type matches selected type
- Check file size < 100 MB

**Preview not showing**
- For images: Check file is actually an image
- For videos: Try a different browser (video codecs vary)
- Check browser console for errors

**File not deleted from disk**
- Check resource had a URL starting with `/uploads/`
- Links and text resources have no files to delete
- Check server logs for delete errors

**Progress bar stuck**
- Large files may take time
- Check network tab in dev tools
- Try a smaller file first

---

## 🎉 Expected Results

When working correctly, you should see:

**Admin Courses Page:**
- Grid of course cards
- Click Workplace Safety → Opens editor

**Course Editor - Lessons Tab:**
- List of lessons on left
- "Manage" button on each lesson
- Resource panel slides in on right when clicked

**Resource Panel:**
- Clean 3-tab interface (Upload/Link/Text)
- Resource list with drag handles
- Rich previews (thumbnails, videos, snippets)
- Metadata badges (type, size, mime)
- Replace button (upload icon) on file resources
- Delete button (trash icon) on all resources

**After Upload:**
- Resource appears instantly in list
- Preview renders (image thumb, video player, etc.)
- Metadata shows below title
- File saved to `/public/uploads/{year}/{month}/{uuid}-{name}`

---

**Ready to test!** 🚀

Navigate to: http://localhost:3000/admin/courses

