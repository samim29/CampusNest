# Virtual Tour Implementation Guide

## 🎯 Implementation Options

### Option 1: 360° Image-Based Tours (RECOMMENDED)
**Best for:** PG rooms, common areas, building exteriors
**Cost:** Low to Medium
**Complexity:** Medium

#### Required Libraries:
```bash
npm install react-pannellum pannellum
# OR
npm install @photo-sphere-viewer/core @photo-sphere-viewer/react
```

#### Integration Steps:
1. **Add Virtual Tour to PG Detail Page:**
```jsx
// In PGDetail.jsx, add a new tab
const tabs = [
  { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
  { id: 'amenities', label: 'Amenities', icon: <Wifi className="w-4 h-4" /> },
  { id: 'rooms', label: 'Rooms', icon: <Bed className="w-4 h-4" /> },
  { id: 'virtual-tour', label: 'Virtual Tour', icon: <Camera className="w-4 h-4" /> }, // NEW
  { id: 'menu', label: 'Menu & Food', icon: <Utensils className="w-4 h-4" /> },
  // ... other tabs
];
```

2. **Add Virtual Tour Content:**
```jsx
// In the tab content section
{activeTab === 'virtual-tour' && (
  <div className="space-y-6">
    <VirtualTour pgData={pgData} />
    
    {/* Additional virtual tour features */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📱 Mobile AR Preview
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Use your phone camera to see how furniture fits in the room
        </p>
      </div>
      
      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
          🎥 Video Walkthrough
        </h3>
        <p className="text-purple-700 dark:text-purple-300 text-sm">
          Watch a guided tour with the PG owner
        </p>
      </div>
    </div>
  </div>
)}
```

### Option 2: Video-Based Virtual Tours
**Best for:** Quick implementation, storytelling
**Cost:** Low
**Complexity:** Low

#### Implementation:
```jsx
const VideoTour = ({ pgData }) => {
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
        <video 
          controls 
          className="w-full h-full"
          poster="https://images.unsplash.com/photo-1560472354-b33ff0c44a43"
        >
          <source src="/tours/pg-walkthrough.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Room Tour', 'Kitchen', 'Common Area', 'Facilities'].map((section) => (
          <button key={section} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <p className="text-sm font-medium">{section}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Option 3: Interactive Floor Plans
**Best for:** Large buildings, complex layouts
**Cost:** Medium
**Complexity:** Medium-High

#### Implementation:
```jsx
const InteractiveFloorPlan = ({ pgData }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  return (
    <div className="relative">
      {/* SVG Floor Plan */}
      <svg viewBox="0 0 800 600" className="w-full h-auto border rounded-xl">
        {/* Room rectangles with click handlers */}
        <rect 
          x="50" y="50" width="200" height="150" 
          fill={selectedRoom === 'room1' ? '#3B82F6' : '#E5E7EB'}
          className="cursor-pointer transition-colors"
          onClick={() => setSelectedRoom('room1')}
        />
        <text x="150" y="125" textAnchor="middle" className="fill-current text-sm font-medium">
          Room 101
        </text>
        
        {/* Add more rooms */}
      </svg>
      
      {/* Room Details Panel */}
      {selectedRoom && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            {selectedRoom === 'room1' ? 'Single Occupancy Room' : 'Room Details'}
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
            Click on rooms to see details and 360° views
          </p>
        </div>
      )}
    </div>
  );
};
```

## 🚀 Advanced Features to Add

### 1. **Augmented Reality (AR) Preview**
```jsx
// Using WebXR or AR.js
const ARPreview = () => {
  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-4">AR Room Preview</h3>
      <button className="bg-purple-600 text-white px-6 py-3 rounded-xl">
        📱 Open AR Camera
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Point your camera to see how the room looks in real space
      </p>
    </div>
  );
};
```

### 2. **Live Virtual Tour Booking**
```jsx
const LiveTourBooking = () => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-4">
        📹 Schedule Live Video Tour
      </h3>
      <div className="space-y-3">
        <input 
          type="datetime-local" 
          className="w-full p-3 border rounded-lg"
          placeholder="Select preferred time"
        />
        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
          Book Live Tour with Owner
        </button>
      </div>
    </div>
  );
};
```

### 3. **Comparison Tool**
```jsx
const TourComparison = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Compare with Other PGs</h4>
        <select className="w-full p-2 border rounded">
          <option>Select PG to compare</option>
          <option>Metro Heights PG</option>
          <option>Campus Inn</option>
        </select>
      </div>
      <button className="bg-blue-600 text-white py-2 rounded-lg">
        Start Comparison
      </button>
    </div>
  );
};
```

## 📱 Mobile Optimization

### Responsive Virtual Tour:
```jsx
const MobileVirtualTour = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <div className={`${isMobile ? 'h-screen' : 'h-96'}`}>
      {/* Mobile-optimized tour interface */}
      {isMobile ? (
        <div className="relative h-full">
          {/* Full-screen mobile tour */}
          <VirtualTourMobile />
        </div>
      ) : (
        <VirtualTour />
      )}
    </div>
  );
};
```

## 💡 Implementation Priority

### Phase 1 (Immediate):
1. ✅ Basic image gallery (already done)
2. 🔄 Simple 360° image viewer
3. 🔄 Video tour integration

### Phase 2 (Next Sprint):
1. Interactive hotspots
2. Mobile AR preview
3. Live tour booking

### Phase 3 (Advanced):
1. Full 3D room models
2. Virtual furniture placement
3. AI-powered tour recommendations

## 🛠️ Technical Requirements

### For 360° Tours:
- **Storage**: 5-10MB per 360° image
- **Bandwidth**: Optimize with progressive loading
- **Browser Support**: WebGL-enabled browsers

### For AR Features:
- **Devices**: iOS 12+, Android 8.0+
- **Permissions**: Camera access
- **Libraries**: WebXR, AR.js, or native apps

## 📊 Implementation Cost Estimate

### DIY Implementation:
- **Development Time**: 2-3 weeks
- **Cost**: Development time only
- **Maintenance**: Medium

### Third-party Solutions:
- **Matterport**: $69-399/month
- **Cupix**: $30-200/month
- **Ricoh Tours**: Custom pricing

### Recommended Approach:
Start with the basic VirtualTour component I created, then gradually add advanced features based on user feedback and business needs.
