# Video Call Troubleshooting Guide

## Common Issues and Solutions

### 1. **Different Logins in Different Browsers**

**Problem**: Users logged in as different accounts in different browsers can't connect to the same video call.

**Solutions**:
- **Use the same account**: Log in with the same user account in both browsers
- **Use incognito/private mode**: Open one browser in incognito mode to test with different accounts
- **Clear browser data**: Clear cookies and cache if switching accounts
- **Use different browsers**: Use completely different browsers (Chrome + Firefox, Edge + Safari)

### 2. **Camera/Microphone Permissions**

**Problem**: Video call keeps loading because browser blocks camera/microphone access.

**Solutions**:
- **Allow permissions**: When prompted, click "Allow" for camera and microphone
- **Check browser settings**: Go to browser settings → Privacy → Site Settings → Camera/Microphone
- **Use HTTPS**: Video calls require HTTPS to access camera/microphone
- **Check browser extensions**: Disable extensions that might block camera access

### 3. **Network/Firewall Issues**

**Problem**: Jitsi can't connect due to network restrictions.

**Solutions**:
- **Check firewall**: Ensure Jitsi domains are not blocked
- **Use different network**: Try from different WiFi or mobile hotspot
- **VPN issues**: Disable VPN if using one
- **Corporate networks**: Some corporate networks block video calls

### 4. **Browser Compatibility**

**Problem**: Video call doesn't work in certain browsers.

**Supported Browsers**:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ❌ Internet Explorer (not supported)

### 5. **Room Access Issues**

**Problem**: Users can't join the same room.

**Solutions**:
- **Same room name**: Ensure both users are using the exact same room name
- **Check call status**: Make sure the call is "ACCEPTED" status
- **Refresh page**: Try refreshing the calls page
- **Check console**: Open browser console (F12) for error messages

## Testing Steps

### Step 1: Test with Same Account
1. Log in with the same account in both browsers
2. Schedule a call between two users
3. Accept the call in both browsers
4. Try joining the call

### Step 2: Test with Different Accounts
1. Log in with different accounts in different browsers
2. Schedule a call between the two accounts
3. Accept the call in both browsers
4. Try joining the call

### Step 3: Use Test Page
1. Go to `/test-video-call` page
2. Enter the same room name in both browsers
3. Enter different user names
4. Start the test call

## Debug Information

### Check Browser Console
1. Open browser console (F12)
2. Look for error messages
3. Check for Jitsi-related errors
4. Look for permission errors

### Check Network Tab
1. Open browser dev tools
2. Go to Network tab
3. Try joining a call
4. Look for failed requests to Jitsi domains

### Common Error Messages
- `"Permission denied"` → Allow camera/microphone access
- `"Failed to load video call service"` → Network/firewall issue
- `"Container not ready"` → Browser compatibility issue
- `"Cannot read properties of null"` → DOM element not found

## Quick Fixes

### For Loading Issues:
1. **Refresh the page**
2. **Clear browser cache**
3. **Try different browser**
4. **Check internet connection**
5. **Disable browser extensions**

### For Permission Issues:
1. **Click "Allow" when prompted**
2. **Check browser settings**
3. **Use HTTPS (not HTTP)**
4. **Try incognito mode**

### For Connection Issues:
1. **Use same room name**
2. **Check call status is "ACCEPTED"**
3. **Try test page first**
4. **Check console for errors**

## Support

If issues persist:
1. Check browser console for specific error messages
2. Try the test page at `/test-video-call`
3. Test with different browsers
4. Check network connectivity
5. Verify camera/microphone permissions 