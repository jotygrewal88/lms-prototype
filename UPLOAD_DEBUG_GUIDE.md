# Upload Issue Diagnostic Guide

## I've Added Extensive Logging

I've added console logging throughout the upload flow to help diagnose the issue:

### Client-Side Logging (Browser Console)
- `[handleFileUpload]` Starting upload with file details
- `[handleFileUpload]` Sending request to /api/upload
- `[handleFileUpload]` Response status and data
- `[handleFileUpload]` Resource creation details
- `[ResourcePreview]` When previews are rendered

### Server-Side Logging (Terminal/Dev Server)
- `[Upload API]` When requests are received
- `[Upload API]` File details and validation
- `[Upload API]` Directory creation
- `[Upload API]` File write operations
- `[Upload API]` Success or error responses

---

## How to Debug

### Step 1: Open Browser Console
1. Navigate to http://localhost:3000/admin/courses
2. Open Browser DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Clear console (trash icon)

### Step 2: Try Uploading
1. Click "Workplace Safety Fundamentals"
2. Click "Lessons" tab
3. Click "Manage" on any lesson (e.g., "Introduction to Workplace Safety")
4. Resource panel opens on right
5. Click "+ Add" button
6. Default tab should be "Upload"
7. Select file type: "Image"
8. Click file picker and select a PNG/JPG

### Step 3: Check Console Logs

**You should see:**
```
Starting upload: { fileName: "...", type: "image", size: ... }
Sending request to /api/upload...
Response status: 200
Response data: { ok: true, url: "/uploads/...", ... }
Creating new resource with data: { ... }
Resource created successfully
Upload process complete, isUploading set to false
[ResourcePreview] Rendering: { type: "image", ... }
```

**If you see errors:**
- Copy the **exact error messages**
- Check if response status is not 200
- Check if result.ok is false
- Note any red error messages

### Step 4: Check Terminal/Dev Server

Switch to the terminal where `npm run dev` is running.

**You should see:**
```
[Upload API] Received upload request
[Upload API] FormData entries: ...
[Upload API] File details: { name: "...", size: ..., type: "image/..." }
[Upload API] Generated paths: { fsPath: "...", publicUrl: "..." }
[Upload API] Writing file to disk...
[Upload API] File written successfully
[Upload API] Returning success: { ok: true, ... }
```

**If you see errors:**
- Copy the **exact error messages**
- Note what step failed

---

## Common Issues & Solutions

### Issue 1: "No lesson selected" error
**Symptom:** Console shows "No lesson selected"
**Fix:** Make sure you clicked "Manage" button on a lesson first

### Issue 2: "Invalid file type" error
**Symptom:** Console shows error about MIME type
**Fix:** 
- Check the file is actually an image (PNG, JPG, GIF, WEBP)
- Make sure file type dropdown matches your file
- Try a different image

### Issue 3: File input doesn't trigger
**Symptom:** No console logs appear when selecting file
**Fix:** 
- Check if file input is visible on page
- Try clicking directly on "Choose File" text
- Check if browser is blocking file access

### Issue 4: Upload hangs (progress spinner doesn't stop)
**Symptom:** "Uploading..." shows indefinitely
**Fix:**
- Check terminal for API errors
- Check browser network tab for failed requests
- Look for JavaScript errors in console

### Issue 5: Resource created but no preview
**Symptom:** Resource appears in list but no thumbnail/preview
**Fix:**
- Check console for `[ResourcePreview]` logs
- Check if resource.url is set correctly
- Check browser network tab - is image loading?
- Try opening the image URL directly in browser

### Issue 6: File not saving to disk
**Symptom:** Upload succeeds but file not in /public/uploads
**Fix:**
- Check terminal logs - did mkdir fail?
- Check disk permissions
- Verify /public/uploads directory exists

---

## What to Share With Me

If it still doesn't work, please share:

1. **Browser Console Output** (all log messages from upload attempt)
2. **Terminal Output** (all [Upload API] messages)
3. **Screenshot** of the upload UI when you click "+ Add"
4. **File type** you're trying to upload (PNG? JPG? Size?)
5. **Any error alerts** that appear
6. **Network Tab** - Status of /api/upload request (200? 400? 500?)

---

## Quick Tests

### Test 1: Check if API is accessible
Open browser console and run:
```javascript
fetch('/api/upload', {
  method: 'POST',
  body: new FormData()
}).then(r => r.json()).then(console.log)
```

Expected: `{ ok: false, error: "No file provided" }`

### Test 2: Check if resource form shows
Navigate to course editor, click Manage on a lesson.
- Do you see the "+ Add" button?
- When clicked, do you see 3 tabs: Upload / Link / Text?
- Is "Upload" tab selected by default?
- Do you see the file type dropdown?
- Do you see the file input button?

### Test 3: Try Link/Text first
Before trying upload, try adding a Link or Text resource:
1. Click "+ Add"
2. Click "Link" tab
3. Enter Title: "Test Link"
4. Enter URL: "https://example.com"
5. Click "Save"

Does the link resource appear in the list?
If yes → Upload logic issue
If no → Broader issue with resource creation

---

## Current Status

✅ Code has been updated with extensive logging
✅ No TypeScript/linter errors
✅ API endpoint is responding
✅ Dev server is running on http://localhost:3000

🔍 **Next**: Try uploading again and share the console logs!

