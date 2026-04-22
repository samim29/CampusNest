# Quick Start Guide

## 🚀 What Was Changed?

### 1. **Data Toggle Feature** 
You can now switch between:
- **Static Mode** (hardcoded data) - Works WITHOUT backend ✅
- **Database Mode** (live data) - Needs backend running ⚠️

### 2. **Login Navigation**
Both main buttons now go to login page:
- "Get Started Free" → Login
- "Start Your Journey" → Login

---

## 🎮 How to Use the Toggle

Look for this widget in the **bottom-right corner**:

```
┌───────────────────────────────┐
│   📊 Data Source     [Demo]   │
├───────────────────────────────┤
│  [💾 Static Data] [💿 Database]│
│       ACTIVE         OFF      │
│                               │
│ ℹ️ Using hardcoded data.      │
│   Works offline without       │
│   backend.                    │
└───────────────────────────────┘
```

**Click** the button to switch modes!

---

## ⚡ Quick Demo (No Backend)

1. Just run:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:5173`

3. You'll see:
   - ✅ 6 PG listings with full details
   - ✅ 4 colleges
   - ✅ Everything works without backend!

---

## 🔄 Switch to Database Mode

1. Start backend:
   ```bash
   cd api
   python app.py
   ```

2. Click **Database** button in the toggle widget

3. Confirm reload → Now using live data!

---

## 📋 What You Get

### Static Data Includes:

**6 PG Listings:**
1. Sunrise Boys PG - ₹12,000 (Single)
2. Green Valley Girls PG - ₹10,000 (Double)
3. City Center Co-Living - ₹15,000 (Premium)
4. Student Haven Boys PG - ₹8,000 (Budget)
5. Royal Girls Hostel - ₹11,000
6. Paradise Boys PG - ₹9,500

**Each with:**
- Photos, amenities, ratings
- Room types, prices, availability
- Policies, contact info
- Realistic data for testing

**4 Colleges:**
- ABC Engineering College (Mumbai)
- XYZ Medical College (Delhi)
- Delhi University
- IIT Bombay

---

## 🎯 Where to Find the Toggle?

The toggle appears **everywhere** - on all pages!

Position: **Bottom-right corner** (floating widget)

---

## 💡 When to Use Each Mode?

### Use **Static Mode** for:
- ✅ Frontend development
- ✅ UI/UX testing
- ✅ Quick demos
- ✅ Offline work
- ✅ No backend setup

### Use **Database Mode** for:
- ✅ Full app testing
- ✅ Backend integration
- ✅ Real user data
- ✅ Production-like environment

---

## 🐛 Troubleshooting

### Toggle not appearing?
- Clear browser cache
- Hard refresh (Ctrl+F5)

### Can't switch to Database mode?
- Make sure backend is running on port 3001
- Check console for errors

### Static data not showing?
- Verify toggle is set to "Static Data"
- Check browser console

---

## 📱 Try It Now!

1. Run `npm run dev`
2. Visit home page
3. Click "Get Started Free" → Goes to login ✅
4. Look bottom-right → See the toggle ✅
5. Toggle is set to "Static Data" by default ✅
6. Browse PG listings → See 6 properties ✅

Everything works without the backend! 🎉

---

**For detailed documentation, see:**
- `DATA_TOGGLE_GUIDE.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - Technical details
