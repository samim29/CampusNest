# Data Source Toggle Feature

## Overview
This application now supports toggling between **Database Mode** and **Static Mode** for data loading.

## How It Works

### Configuration File
The main configuration is in `src/config/appConfig.js`:

```javascript
export const APP_CONFIG = {
  USE_DATABASE: false,  // Set to true for database, false for static data
  // ... other configs
}
```

### Two Modes

#### 1. Static Mode (USE_DATABASE = false)
- ✅ Works **without** backend server
- ✅ Uses hardcoded data from `src/data/staticData.js`
- ✅ Perfect for development and testing
- ✅ No database connection needed
- Includes:
  - 6 sample PG listings
  - 4 sample colleges
  - Demo user profile

#### 2. Database Mode (USE_DATABASE = true)
- ⚠️ Requires backend server running on `http://localhost:3001`
- Uses live data from PostgreSQL/SQLite database
- Real-time updates
- Full CRUD operations

## How to Toggle

### Method 1: Using the UI Toggle (Recommended)
1. Look for the **Data Source Toggle** widget in the bottom-right corner of the screen
2. Click on either:
   - **Static Data** button (HardDrive icon) - for offline/demo mode
   - **Database** button (Database icon) - for live data mode
3. Confirm the page reload to apply changes

### Method 2: Manual Configuration
1. Open `src/config/appConfig.js`
2. Change `USE_DATABASE` to `true` or `false`
3. Save the file
4. Refresh your browser

### Method 3: Using Browser Console
```javascript
localStorage.setItem('useDatabase', 'false')  // For static mode
localStorage.setItem('useDatabase', 'true')   // For database mode
window.location.reload()
```

## Navigation Updates

### "Get Started Free" and "Start Your Journey" Buttons
Both buttons on the home page now navigate to the **Login Page** (`/login`) instead of the dashboard:
- **Get Started Free** (Hero section) → `/login`
- **Start Your Journey** (CTA section) → `/login`

This ensures users must log in before accessing the application features.

## Static Data Structure

The static data is defined in `src/data/staticData.js` and includes:

### PG Listings (6 properties)
- Sunrise Boys PG
- Green Valley Girls PG
- City Center Co-Living
- Student Haven Boys PG
- Royal Girls Hostel
- Paradise Boys PG

Each listing includes:
- Name, location, price
- Ratings and reviews
- Amenities (Wi-Fi, AC, Meals, etc.)
- Room types and availability
- Policies (check-in, visitors, food, cleaning)
- Images and contact information

### Colleges (4 institutions)
- ABC Engineering College (Mumbai)
- XYZ Medical College (Delhi)
- Delhi University
- IIT Bombay

### User Profile
- Demo user with basic profile information

## Development Workflow

### Starting Without Backend
```bash
# Just run the frontend
npm run dev
```
The app will work perfectly with static data!

### Starting With Backend
```bash
# Terminal 1: Start backend
cd api
python app.py

# Terminal 2: Start frontend
npm run dev
```

Then toggle to Database mode using the UI widget.

## API Integration

The `src/hooks/useApi.js` file has been updated to check the `USE_DATABASE` flag:

```javascript
export const usePGs = (filters = {}) => {
  return useQuery({
    queryKey: ['pgs', filters],
    queryFn: async () => {
      if (!APP_CONFIG.USE_DATABASE) {
        return STATIC_PG_LISTINGS  // Return static data
      }
      return apiCall(`/pgs`)  // Call API
    },
    // ...
  })
}
```

This pattern is applied to:
- `usePGs()` - Get all PG listings
- `usePG(id)` - Get single PG details
- `useColleges()` - Get all colleges
- `useUser()` - Get user profile

## Benefits

✅ **No Backend Required**: Develop and test frontend features without running the backend
✅ **Faster Development**: No need to seed database or manage test data
✅ **Easy Testing**: Predictable data for UI testing
✅ **Offline Support**: Works completely offline in static mode
✅ **Flexible**: Switch between modes anytime with one click
✅ **Demo Mode**: Perfect for showcasing the app without setup

## Troubleshooting

### Toggle not working?
- Clear browser cache and reload
- Check browser console for errors
- Ensure localStorage is enabled

### Database mode not working?
- Verify backend server is running on port 3001
- Check database connection in backend
- Look at browser console and backend logs

### Static data not showing?
- Verify `src/data/staticData.js` exists
- Check for import errors in console
- Ensure `USE_DATABASE` is set to `false`

## Future Enhancements

- [ ] Add more static data samples
- [ ] Persist user preferences across sessions
- [ ] Add data export/import functionality
- [ ] Create hybrid mode (partial static, partial live)
- [ ] Add data caching layer

---

**Note**: The UI toggle widget appears on all pages and persists your choice in `localStorage`. The selected mode will be remembered across browser sessions.
